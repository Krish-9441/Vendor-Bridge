import { Invoice } from './invoice.model.js';
import { PurchaseOrder } from '../purchaseOrders/purchaseOrder.model.js';
import { Quotation } from '../quotations/quotation.model.js';
import { Rfq } from '../rfq/rfq.model.js';
import { Vendor } from '../vendors/vendor.model.js';
import { logActivityAndNotify } from '../../shared/services/activityLogger.service.js';
import { generateSequenceNumber } from '../../shared/services/numberGenerator.service.js';
import { sendEmail } from '../../shared/services/email.service.js';
import mongoose from 'mongoose';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getInvoices = async ({ filter, sort, skip, limit }) => {
  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('purchaseOrderId', 'poNumber')
      .populate('vendorId', 'companyName')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Invoice.countDocuments(filter)
  ]);

  return {
    invoices,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id)
    .populate({
      path: 'purchaseOrderId',
      populate: { path: 'rfqId' }
    })
    .populate('vendorId', 'companyName email phone taxId contactEmail')
    .lean();
    
  if (!invoice) throw new Error('NOT_FOUND');
  return invoice;
};

export const generateInvoice = async (purchaseOrderId, vendorId, taxRate = 0) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const po = await PurchaseOrder.findById(purchaseOrderId).session(session);
    if (!po) throw new Error('NOT_FOUND: PO not found');
    
    // Authorization Check
    if (po.vendorId.toString() !== vendorId.toString()) {
      throw new Error('FORBIDDEN: You do not own this PO');
    }

    if (po.status !== 'ACKNOWLEDGED' && po.status !== 'COMPLETED') {
      throw new Error('CONFLICT: PO must be ACKNOWLEDGED before generating an invoice');
    }

    const existingInvoice = await Invoice.findOne({ purchaseOrderId: po._id }).session(session);
    if (existingInvoice) {
      throw new Error('CONFLICT: Invoice already generated for this PO');
    }

    const subtotal = po.totalAmount;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    
    const invoiceNumber = await generateSequenceNumber('INV');

    const invoice = await Invoice.create(
      [{
        invoiceNumber,
        purchaseOrderId: po._id,
        vendorId: po.vendorId,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        status: 'GENERATED'
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    await logActivityAndNotify({
      entityType: 'INVOICE',
      entityId: invoice[0]._id,
      action: 'INVOICE_GENERATED',
      actorId: vendorId
    });

    return invoice[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const updateInvoiceStatus = async (id, status, actorId, actorRole) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new Error('NOT_FOUND');

  // Vendors cannot mark as paid
  if (status === 'PAID' && actorRole === 'VENDOR') {
    throw new Error('FORBIDDEN: Vendors cannot mark invoices as paid');
  }

  invoice.status = status;
  await invoice.save();

  await logActivityAndNotify({
    entityType: 'INVOICE',
    entityId: invoice._id,
    action: `INVOICE_${status}`,
    actorId
  });

  return invoice;
};

export const generatePdfStream = async (id) => {
  const invoice = await getInvoiceById(id);
  const po = invoice.purchaseOrderId;
  const quotation = po.quotationId ? await Quotation.findById(po.quotationId).lean() : null;
  // Safely get items — rfqId may not always have itemDetails populated
  const items = (po.rfqId && po.rfqId.itemDetails) ? po.rfqId.itemDetails : [];

  const templatePath = path.join(__dirname, 'templates', 'invoice-template.ejs');
  const html = await ejs.renderFile(templatePath, {
    invoice,
    vendor: invoice.vendorId,
    po,
    quotation,
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

  return { pdfBuffer, invoiceNumber: invoice.invoiceNumber };
};

export const sendInvoiceEmail = async (id, vendorId) => {
  const invoice = await Invoice.findById(id).populate('vendorId', 'companyName');
  if (!invoice) throw new Error('NOT_FOUND');
  
  if (invoice.vendorId._id.toString() !== vendorId.toString()) {
    throw new Error('FORBIDDEN: You do not own this invoice');
  }

  const { pdfBuffer, invoiceNumber } = await generatePdfStream(id);

  // Email setup
  const subject = `Invoice ${invoiceNumber} from ${invoice.vendorId.companyName}`;
  const html = `
    <p>Dear Procurement Team,</p>
    <p>Please find attached the invoice <strong>${invoiceNumber}</strong> generated by <strong>${invoice.vendorId.companyName}</strong>.</p>
    <p>We look forward to receiving your payment.</p>
    <br/>
    <p>Thank you.</p>
  `;

  // Send Email
  const emailResult = await sendEmail({
    to: 'accounts@vendorbridge.com',
    subject,
    html,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer,
      }
    ]
  });

  invoice.status = 'SENT';
  invoice.sentAt = new Date();
  await invoice.save();

  await logActivityAndNotify({
    entityType: 'INVOICE',
    entityId: invoice._id,
    action: 'INVOICE_SENT',
    actorId: vendorId
  });

  return { invoice, emailResult };
};
