import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { getPaginationOptions, formatPaginationMeta } from '../../shared/utils/pagination.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import * as quotationService from './quotations.service.js';

export const getQuotations = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPaginationOptions(req.query);
  const filter = {};

  if (req.query.rfqId) filter.rfqId = req.query.rfqId;
  if (req.query.status) filter.status = req.query.status;

  // Vendors can only see their own quotations
  if (req.user.role === 'VENDOR') {
    filter.vendorId = req.user.vendorId;
  } else if (req.query.vendorId) {
    // Admins/Officers can filter by vendor
    filter.vendorId = req.query.vendorId;
  }

  const { quotations, total } = await quotationService.getQuotations({ filter, sort, skip, limit });
  const meta = formatPaginationMeta(total, page, limit);

  return sendSuccess(res, 200, 'Quotations retrieved successfully', quotations, meta);
});

export const getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await quotationService.getQuotationById(req.params.id);
  if (!quotation) return sendError(res, 404, 'Quotation not found');

  if (req.user.role === 'VENDOR' && quotation.vendorId._id.toString() !== req.user.vendorId.toString()) {
    return sendError(res, 403, 'Forbidden: You can only view your own quotations');
  }

  return sendSuccess(res, 200, 'Quotation retrieved successfully', quotation);
});

export const createQuotation = asyncHandler(async (req, res) => {
  try {
    const quotation = await quotationService.createQuotation(req.body, req.user.vendorId, req.user.sub);
    const quotationData = await quotationService.getQuotationById(quotation._id);
    return sendSuccess(res, 201, 'Quotation submitted successfully', quotationData);
  } catch (err) {
    if (err.message.startsWith('VALIDATION_ERROR')) return sendError(res, 400, err.message);
    throw err;
  }
});

export const updateQuotation = asyncHandler(async (req, res) => {
  try {
    const quotation = await quotationService.updateQuotation(req.params.id, req.body, req.user.vendorId, req.user.sub);
    const quotationData = await quotationService.getQuotationById(quotation._id);
    return sendSuccess(res, 200, 'Quotation updated successfully', quotationData);
  } catch (err) {
    if (err.message.startsWith('FORBIDDEN')) return sendError(res, 403, err.message);
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Quotation not found');
    throw err;
  }
});

export const withdrawQuotation = asyncHandler(async (req, res) => {
  try {
    const quotation = await quotationService.withdrawQuotation(req.params.id, req.user.vendorId, req.user.sub);
    const quotationData = await quotationService.getQuotationById(quotation._id);
    return sendSuccess(res, 200, 'Quotation withdrawn successfully', quotationData);
  } catch (err) {
    if (err.message.startsWith('FORBIDDEN')) return sendError(res, 403, err.message);
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Quotation not found');
    throw err;
  }
});

export const selectQuotation = asyncHandler(async (req, res) => {
  try {
    const result = await quotationService.selectQuotation(req.params.id, req.user.sub);
    return sendSuccess(res, 200, 'Quotation selected and sent for approval', result);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Quotation not found');
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    throw err;
  }
});
