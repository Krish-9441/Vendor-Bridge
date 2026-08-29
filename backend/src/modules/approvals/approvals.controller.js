import * as approvalsService from './approvals.service.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const getApprovals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.rfqId) filter.rfqId = req.query.rfqId;

  // Assuming sort by created descending
  const sort = { createdAt: -1 };

  const data = await approvalsService.getApprovals({ filter, sort, skip, limit });
  return sendSuccess(res, 200, 'Approvals retrieved successfully', data);
});

export const getApprovalById = asyncHandler(async (req, res) => {
  try {
    const approval = await approvalsService.getApprovalById(req.params.id);
    return sendSuccess(res, 200, 'Approval details retrieved successfully', approval);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Approval not found');
    throw err;
  }
});

export const approveQuotation = asyncHandler(async (req, res) => {
  try {
    const approval = await approvalsService.processApproval(req.params.id, req.user.sub, 'APPROVE', req.body.remarks);
    return sendSuccess(res, 200, 'Quotation approved successfully', approval);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Approval not found');
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    throw err;
  }
});

export const rejectQuotation = asyncHandler(async (req, res) => {
  try {
    const approval = await approvalsService.processApproval(req.params.id, req.user.sub, 'REJECT', req.body.remarks);
    return sendSuccess(res, 200, 'Quotation rejected successfully', approval);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Approval not found');
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    throw err;
  }
});
