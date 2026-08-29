import { PurchaseOrder } from './purchaseOrder.model.js';
import { Approval } from '../approvals/approval.model.js';
import { Quotation } from '../quotations/quotation.model.js';
import { Rfq } from '../rfq/rfq.model.js';
import { Vendor } from '../vendors/vendor.model.js';
import { logActivityAndNotify } from '../../shared/services/activityLogger.service.js';
import { generateSequenceNumber } from '../../shared/services/numberGenerator.service.js';
import mongoose from 'mongoose';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPurchaseOrders = async ({ filter, sort, skip, limit }) => {
  const [purchaseOrders, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .populate('rfqId', 'rfqNumber title')
      .populate('vendorId', 'companyName')
      .populate('issuedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    PurchaseOrder.countDocuments(filter)
  ]);

  return {
    purchaseOrders,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getPurchaseOrderById = async (id) => {
  const po = await PurchaseOrder.findById(id)
    .populate('rfqId')
    .populate('quotationId')
    .populate('vendorId', 'companyName email phone taxId contactEmail')
    .populate('issuedBy', 'name email')
    .lean();
    
  if (!po) throw new Error('NOT_FOUND');
  return po;
};

export const generatePo = async (approvalId, actorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const approval = await Approval.findById(approvalId).session(session);
    if (!approval) throw new Error('NOT_FOUND: Approval not found');
    if (approval.status !== 'APPROVED') {
      throw new Error('CONFLICT: Approval must be in APPROVED state to generate a PO');
    }

    const quotation = await Quotation.findById(approval.quotationId).session(session);
    if (!quotation || quotation.status !== 'AWARDED') {
      throw new Error('CONFLICT: Quotation must be AWARDED');
    }

    // Check if PO already exists
    const existingPo = await PurchaseOrder.findOne({ approvalId: approval._id }).session(session);
    if (existingPo) {
      throw new Error('CONFLICT: Purchase Order already generated for this approval');
    }

    const rfq = await Rfq.findById(approval.rfqId).session(session);
    
    // Generate PO Number
    const poNumber = await generateSequenceNumber('PO');

    const purchaseOrder = await PurchaseOrder.create(
      [{
        poNumber,
        quotationId: quotation._id,
        approvalId: approval._id,
        rfqId: rfq._id,
        vendorId: quotation.vendorId,
        issuedBy: actorId,
        status: 'ISSUED',
        totalAmount: quotation.totalAmount
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Notify vendor
    await logActivityAndNotify({
      entityType: 'PO',
      entityId: purchaseOrder[0]._id,
      action: 'PO_ISSUED',
      actorId,
      notifications: [{
        userId: quotation.vendorId,
        type: 'PO_ISSUED',
        title: 'New Purchase Order Issued',
        message: `You have received a new Purchase Order: ${poNumber}`,
      }]
    });

    return purchaseOrder[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const updatePoStatus = async (id, status, actorId, actorRole) => {
  const po = await PurchaseOrder.findById(id);
  if (!po) throw new Error('NOT_FOUND');

  // Authorization checks
  if (status === 'ACKNOWLEDGED' && actorRole !== 'VENDOR') {
    throw new Error('FORBIDDEN: Only vendors can acknowledge POs');
  }
  if ((status === 'COMPLETED' || status === 'CANCELLED') && actorRole === 'VENDOR') {
    throw new Error('FORBIDDEN: Vendors cannot complete or cancel POs');
  }

  po.status = status;
  await po.save();

  await logActivityAndNotify({
    entityType: 'PO',
    entityId: po._id,
    action: `PO_${status}`,
    actorId
  });

  return po;
};

export const generatePdfStream = async (id) => {
  const po = await getPurchaseOrderById(id);
  // Safely get items — rfqId may not always have itemDetails populated
  const items = (po.rfqId && po.rfqId.itemDetails) ? po.rfqId.itemDetails : [];

  const templatePath = path.join(__dirname, 'templates', 'po-template.ejs');
  const html = await ejs.renderFile(templatePath, {
    po,
    vendor: po.vendorId,
    quotation: po.quotationId,
    items
  });

  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return { pdfBuffer, poNumber: po.poNumber };
};
