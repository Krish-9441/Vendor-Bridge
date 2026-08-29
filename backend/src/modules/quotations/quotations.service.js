import { Quotation } from './quotation.model.js';
import { Rfq } from '../rfq/rfq.model.js';
import { Approval } from '../approvals/approval.model.js';
import { logActivityAndNotify } from '../../shared/services/activityLogger.service.js';
import mongoose from 'mongoose';

export const getQuotations = async ({ filter, sort, skip, limit }) => {
  const [quotations, total] = await Promise.all([
    Quotation.find(filter)
      .populate('rfqId', 'rfqNumber title deadline status')
      .populate('vendorId', 'companyName status rating')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Quotation.countDocuments(filter),
  ]);

  return { quotations, total };
};

export const getQuotationById = async (id) => {
  const quotation = await Quotation.findById(id)
    .populate('rfqId', 'rfqNumber title description deadline status')
    .populate('vendorId', 'companyName contactEmail contactPhone')
    .lean();

  if (!quotation) return null;
  
  quotation.id = quotation._id;
  delete quotation._id;
  delete quotation.__v;
  
  return quotation;
};

export const createQuotation = async (data, vendorId, actorId) => {
  const { rfqId, unitPrice, quantity, deliveryDays, remarks } = data;

  // 1. Fetch RFQ to validate state and assignment
  const rfq = await Rfq.findById(rfqId);
  if (!rfq) throw new Error('VALIDATION_ERROR: RFQ not found');
  
  if (rfq.status !== 'PUBLISHED') {
    throw new Error('VALIDATION_ERROR: Cannot quote on an RFQ that is not PUBLISHED');
  }

  // 2. Deadline check
  if (new Date(rfq.deadline) < new Date()) {
    throw new Error('VALIDATION_ERROR: RFQ deadline has passed');
  }

  // 3. Assignment check
  const isAssigned = rfq.assignedVendors.some(vId => vId.toString() === vendorId.toString());
  if (!isAssigned) {
    throw new Error('VALIDATION_ERROR: You are not assigned to this RFQ');
  }

  // 4. Duplicate check
  const existingQuotation = await Quotation.findOne({ rfqId, vendorId, status: { $ne: 'WITHDRAWN' } });
  if (existingQuotation) {
    throw new Error('VALIDATION_ERROR: You have already submitted a quotation for this RFQ');
  }

  // 5. Calculate total
  const totalAmount = unitPrice * quantity;

  // 6. Create
  const quotation = await Quotation.create({
    rfqId,
    vendorId,
    unitPrice,
    quantity,
    totalAmount,
    deliveryDays,
    remarks,
    status: 'SUBMITTED',
  });

  // 7. Log & Notify Officer
  await logActivityAndNotify({
    entityType: 'QUOTATION',
    entityId: quotation._id,
    action: 'QUOTATION_SUBMITTED',
    actorId,
    notifications: [{
      userId: rfq.createdBy,
      type: 'QUOTATION_RECEIVED',
      title: 'New Quotation Received',
      message: `A new quotation has been submitted for RFQ ${rfq.rfqNumber}`,
    }],
  });

  return quotation;
};

export const updateQuotation = async (id, data, vendorId, actorId) => {
  const quotation = await Quotation.findById(id).populate('rfqId');
  if (!quotation) throw new Error('NOT_FOUND');

  // Ownership check
  if (quotation.vendorId.toString() !== vendorId.toString()) {
    throw new Error('FORBIDDEN: You can only edit your own quotations');
  }

  // Status check
  if (quotation.status !== 'SUBMITTED') {
    throw new Error('CONFLICT: Cannot edit a quotation that is not in SUBMITTED state');
  }

  // RFQ status and deadline check
  const rfq = quotation.rfqId;
  if (rfq.status !== 'PUBLISHED') {
    throw new Error('CONFLICT: Cannot edit quotation because RFQ is no longer published');
  }
  if (new Date(rfq.deadline) < new Date()) {
    throw new Error('CONFLICT: RFQ deadline has passed, editing is locked');
  }

  // Update fields and recalculate total
  if (data.unitPrice !== undefined) quotation.unitPrice = data.unitPrice;
  if (data.quantity !== undefined) quotation.quantity = data.quantity;
  if (data.deliveryDays !== undefined) quotation.deliveryDays = data.deliveryDays;
  if (data.remarks !== undefined) quotation.remarks = data.remarks;
  
  quotation.totalAmount = quotation.unitPrice * quotation.quantity;

  await quotation.save();

  await logActivityAndNotify({
    entityType: 'QUOTATION',
    entityId: quotation._id,
    action: 'QUOTATION_UPDATED',
    actorId,
  });

  return quotation;
};

export const withdrawQuotation = async (id, vendorId, actorId) => {
  const quotation = await Quotation.findById(id).populate('rfqId');
  if (!quotation) throw new Error('NOT_FOUND');

  // Ownership check
  if (quotation.vendorId.toString() !== vendorId.toString()) {
    throw new Error('FORBIDDEN: You can only withdraw your own quotations');
  }

  // Status check
  if (quotation.status !== 'SUBMITTED') {
    throw new Error('CONFLICT: Only SUBMITTED quotations can be withdrawn');
  }

  quotation.status = 'WITHDRAWN';
  await quotation.save();

  const rfq = quotation.rfqId;
  await logActivityAndNotify({
    entityType: 'QUOTATION',
    entityId: quotation._id,
    action: 'QUOTATION_WITHDRAWN',
    actorId,
    notifications: [{
      userId: rfq.createdBy,
      type: 'QUOTATION_WITHDRAWN',
      title: 'Quotation Withdrawn',
      message: `A quotation was withdrawn for RFQ ${rfq.rfqNumber}`,
    }],
  });

  return quotation;
};

export const selectQuotation = async (id, actorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const quotation = await Quotation.findById(id).populate('rfqId').session(session);
    if (!quotation) throw new Error('NOT_FOUND');
    if (quotation.status !== 'SUBMITTED') {
      throw new Error('CONFLICT: Quotation must be in SUBMITTED state to be selected');
    }

    const rfq = quotation.rfqId;
    if (rfq.status !== 'PUBLISHED') {
      throw new Error('CONFLICT: RFQ must be in PUBLISHED state to select a quotation');
    }

    // 1. Mark this quotation as SELECTED
    quotation.status = 'SELECTED';
    await quotation.save({ session });

    // 2. Mark all other submitted quotations as REJECTED
    await Quotation.updateMany(
      { rfqId: rfq._id, _id: { $ne: quotation._id }, status: 'SUBMITTED' },
      { $set: { status: 'REJECTED' } },
      { session }
    );

    // 3. Mark RFQ as CLOSED
    rfq.status = 'CLOSED';
    await rfq.save({ session });

    // 4. Create an Approval record
    const approval = await Approval.create(
      [{
        quotationId: quotation._id,
        rfqId: rfq._id,
        requestedBy: actorId,
        status: 'PENDING'
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Fan-out notifications out of transaction
    await logActivityAndNotify({
      entityType: 'QUOTATION',
      entityId: quotation._id,
      action: 'QUOTATION_SELECTED',
      actorId
    });

    return { quotation, approval: approval[0] };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
