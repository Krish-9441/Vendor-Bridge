import * as purchaseOrderService from './purchaseOrder.service.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const getPurchaseOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.user.role === 'VENDOR') {
    filter.vendorId = req.user.vendorId;
  }
  
  if (req.query.status) filter.status = req.query.status;

  const sort = { createdAt: -1 };

  const data = await purchaseOrderService.getPurchaseOrders({ filter, sort, skip, limit });
  return sendSuccess(res, 200, 'Purchase Orders retrieved successfully', data);
});

export const getPurchaseOrderById = asyncHandler(async (req, res) => {
  try {
    const po = await purchaseOrderService.getPurchaseOrderById(req.params.id);
    
    // Authorization check
    if (req.user.role === 'VENDOR' && po.vendorId._id.toString() !== req.user.vendorId) {
      return sendError(res, 403, 'Access denied to this PO');
    }
    
    return sendSuccess(res, 200, 'Purchase Order details retrieved successfully', po);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Purchase Order not found');
    throw err;
  }
});

export const generatePo = asyncHandler(async (req, res) => {
  try {
    const po = await purchaseOrderService.generatePo(req.body.approvalId, req.user.sub);
    return sendSuccess(res, 201, 'Purchase Order generated successfully', po);
  } catch (err) {
    if (err.message.startsWith('NOT_FOUND')) return sendError(res, 404, err.message);
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    throw err;
  }
});

export const updatePoStatus = asyncHandler(async (req, res) => {
  try {
    const po = await purchaseOrderService.updatePoStatus(req.params.id, req.body.status, req.user.sub, req.user.role);
    return sendSuccess(res, 200, 'Purchase Order status updated successfully', po);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Purchase Order not found');
    if (err.message.startsWith('FORBIDDEN')) return sendError(res, 403, err.message);
    throw err;
  }
});

export const generatePdf = asyncHandler(async (req, res) => {
  try {
    // Basic auth check inline since it's a stream
    const poData = await purchaseOrderService.getPurchaseOrderById(req.params.id);
    if (req.user.role === 'VENDOR' && poData.vendorId._id.toString() !== req.user.vendorId) {
      return sendError(res, 403, 'Access denied to this PO');
    }

    const { pdfBuffer, poNumber } = await purchaseOrderService.generatePdfStream(req.params.id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${poNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    return res.end(pdfBuffer);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Purchase Order not found');
    throw err;
  }
});
