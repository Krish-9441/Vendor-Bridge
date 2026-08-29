import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { getPaginationOptions, formatPaginationMeta } from '../../shared/utils/pagination.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import * as rfqService from './rfq.service.js';
import { Rfq } from './rfq.model.js';

// Helper to check ownership
const checkOwnership = async (req, res, rfqId) => {
  if (req.user.role === 'ADMIN') return true;
  
  const rfq = await Rfq.findById(rfqId).select('createdBy');
  if (!rfq) {
    sendError(res, 404, 'RFQ not found');
    return false;
  }
  
  if (rfq.createdBy.toString() !== req.user.sub) {
    sendError(res, 403, 'Forbidden: You can only manage your own RFQs');
    return false;
  }
  return true;
};

export const getRfqs = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPaginationOptions(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.createdBy) filter.createdBy = req.query.createdBy;

  // Auto-scope for Vendor
  if (req.user.role === 'VENDOR') {
    if (!req.user.vendorId) {
      return sendSuccess(res, 200, 'RFQs retrieved successfully', [], formatPaginationMeta(0, page, limit));
    }
    filter.assignedVendors = req.user.vendorId;
  }

  const { rfqs, total } = await rfqService.getRfqs({ filter, sort, skip, limit });
  const meta = formatPaginationMeta(total, page, limit);

  return sendSuccess(res, 200, 'RFQs retrieved successfully', rfqs, meta);
});

export const getRfqById = asyncHandler(async (req, res) => {
  const rfq = await rfqService.getRfqById(req.params.id);
  if (!rfq) return sendError(res, 404, 'RFQ not found');

  // Vendor access check: must be in assignedVendors
  if (req.user.role === 'VENDOR') {
    const isAssigned = rfq.assignedVendors.some(v => v.id.toString() === req.user.vendorId.toString());
    if (!isAssigned) {
      return sendError(res, 403, 'Forbidden: You are not assigned to this RFQ');
    }
  }

  return sendSuccess(res, 200, 'RFQ retrieved successfully', rfq);
});

export const createRfq = asyncHandler(async (req, res) => {
  try {
    const rfq = await rfqService.createRfq(req.body, req.user.sub);
    const rfqData = await rfqService.getRfqById(rfq._id);
    return sendSuccess(res, 201, 'RFQ created successfully', rfqData);
  } catch (err) {
    if (err.message.includes('VALIDATION_ERROR')) {
      return sendError(res, 400, err.message);
    }
    throw err;
  }
});

export const updateRfq = asyncHandler(async (req, res) => {
  const isOwner = await checkOwnership(req, res, req.params.id);
  if (!isOwner) return;

  try {
    const rfq = await rfqService.updateRfq(req.params.id, req.body, req.user.sub);
    const rfqData = await rfqService.getRfqById(rfq._id);
    return sendSuccess(res, 200, 'RFQ updated successfully', rfqData);
  } catch (err) {
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'RFQ not found');
    throw err;
  }
});

export const publishRfq = asyncHandler(async (req, res) => {
  const isOwner = await checkOwnership(req, res, req.params.id);
  if (!isOwner) return;

  try {
    const rfq = await rfqService.publishRfq(req.params.id, req.user.sub);
    const rfqData = await rfqService.getRfqById(rfq._id);
    return sendSuccess(res, 200, 'RFQ published successfully', rfqData);
  } catch (err) {
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    if (err.message.startsWith('VALIDATION_ERROR')) return sendError(res, 400, err.message);
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'RFQ not found');
    throw err;
  }
});

export const addAttachments = asyncHandler(async (req, res) => {
  const isOwner = await checkOwnership(req, res, req.params.id);
  if (!isOwner) return;

  if (!req.file) {
    return sendError(res, 400, 'No file uploaded');
  }

  try {
    await rfqService.addAttachments(req.params.id, req.file, req.user.sub);
    // Spec specifies returning just fileName and filePath
    const data = {
      fileName: req.file.originalname,
      filePath: `/uploads/rfq/${req.file.filename}`,
    };
    return sendSuccess(res, 201, 'Attachment added successfully', data);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'RFQ not found');
    throw err;
  }
});

export const assignVendors = asyncHandler(async (req, res) => {
  const isOwner = await checkOwnership(req, res, req.params.id);
  if (!isOwner) return;

  try {
    const rfq = await rfqService.assignVendors(req.params.id, req.body.vendorIds, req.user.sub);
    const rfqData = await rfqService.getRfqById(rfq._id);
    return sendSuccess(res, 200, 'Vendors assigned successfully', rfqData);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'RFQ not found');
    throw err;
  }
});

export const cancelRfq = asyncHandler(async (req, res) => {
  const isOwner = await checkOwnership(req, res, req.params.id);
  if (!isOwner) return;

  try {
    const rfq = await rfqService.cancelRfq(req.params.id, req.body.reason, req.user.sub);
    const rfqData = await rfqService.getRfqById(rfq._id);
    return sendSuccess(res, 200, 'RFQ cancelled successfully', rfqData);
  } catch (err) {
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'RFQ not found');
    throw err;
  }
});

export const compareQuotations = asyncHandler(async (req, res) => {
  try {
    const comparisonData = await rfqService.compareQuotations(req.params.id);
    return sendSuccess(res, 200, 'Quotation comparison retrieved successfully', comparisonData);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'RFQ not found');
    throw err;
  }
});
