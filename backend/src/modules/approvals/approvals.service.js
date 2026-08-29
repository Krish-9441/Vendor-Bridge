import { Approval } from './approval.model.js';
import { Quotation } from '../quotations/quotation.model.js';
import { Rfq } from '../rfq/rfq.model.js';
import { logActivityAndNotify } from '../../shared/services/activityLogger.service.js';
import mongoose from 'mongoose';

export const getApprovals = async ({ filter, sort, skip, limit }) => {
  const [approvals, total] = await Promise.all([
    Approval.find(filter)
      .populate('rfqId', 'rfqNumber title status')
      .populate('requestedBy', 'name email')
      .populate('approverId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Approval.countDocuments(filter)
  ]);

  return {
    approvals,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getApprovalById = async (id) => {
  const approval = await Approval.findById(id)
    .populate('rfqId')
    .populate({
      path: 'quotationId',
      populate: {
        path: 'vendorId',
        select: 'companyName email phone category rating'
      }
    })
    .populate('requestedBy', 'name email')
    .populate('approverId', 'name email')
    .lean();
    
  if (!approval) throw new Error('NOT_FOUND');
  return approval;
};

export const processApproval = async (approvalId, actorId, action, remarks) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const approval = await Approval.findById(approvalId).session(session);
    if (!approval) throw new Error('NOT_FOUND');
    if (approval.status !== 'PENDING') {
      throw new Error('CONFLICT: Approval is already processed');
    }

    const quotation = await Quotation.findById(approval.quotationId).session(session);
    const rfq = await Rfq.findById(approval.rfqId).session(session);

    if (!quotation || !rfq) {
      throw new Error('NOT_FOUND');
    }

    approval.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    approval.approverId = actorId;
    approval.decidedAt = new Date();
    if (remarks) approval.remarks = remarks;

    if (action === 'APPROVE') {
      quotation.status = 'AWARDED';
      rfq.status = 'AWARDED';
    } else if (action === 'REJECT') {
      quotation.status = 'REJECTED';
      // If rejected, RFQ goes back to EVALUATING so the Officer can select another quotation
      rfq.status = 'EVALUATING';
    }

    await approval.save({ session });
    await quotation.save({ session });
    await rfq.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Fan-out notifications out of transaction
    if (action === 'APPROVE') {
      await logActivityAndNotify({
        entityType: 'APPROVAL',
        entityId: approval._id,
        action: 'QUOTATION_AWARDED',
        actorId,
        metadata: { quotationId: quotation._id }
      });
    } else {
      await logActivityAndNotify({
        entityType: 'APPROVAL',
        entityId: approval._id,
        action: 'APPROVAL_REJECTED',
        actorId,
        metadata: { remarks }
      });
    }

    return approval;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
