import * as invoiceService from './invoice.service.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const getInvoices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.user.role === 'VENDOR') {
    filter.vendorId = req.user.vendorId;
  }
  
  if (req.query.status) filter.status = req.query.status;

  const sort = { createdAt: -1 };

  const data = await invoiceService.getInvoices({ filter, sort, skip, limit });
  return sendSuccess(res, 200, 'Invoices retrieved successfully', data);
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    
    if (req.user.role === 'VENDOR' && invoice.vendorId._id.toString() !== req.user.vendorId) {
      return sendError(res, 403, 'Access denied to this Invoice');
    }
    
    return sendSuccess(res, 200, 'Invoice details retrieved successfully', invoice);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Invoice not found');
    throw err;
  }
});

export const generateInvoice = asyncHandler(async (req, res) => {
  try {
    const invoice = await invoiceService.generateInvoice(req.body.purchaseOrderId, req.user.vendorId, req.body.taxRate);
    return sendSuccess(res, 201, 'Invoice generated successfully', invoice);
  } catch (err) {
    if (err.message.startsWith('NOT_FOUND')) return sendError(res, 404, err.message);
    if (err.message.startsWith('FORBIDDEN')) return sendError(res, 403, err.message);
    if (err.message.startsWith('CONFLICT')) return sendError(res, 409, err.message);
    throw err;
  }
});

export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  try {
    const invoice = await invoiceService.updateInvoiceStatus(req.params.id, req.body.status, req.user.sub, req.user.role);
    return sendSuccess(res, 200, 'Invoice status updated successfully', invoice);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Invoice not found');
    if (err.message.startsWith('FORBIDDEN')) return sendError(res, 403, err.message);
    throw err;
  }
});

export const generatePdf = asyncHandler(async (req, res) => {
  try {
    const invoiceData = await invoiceService.getInvoiceById(req.params.id);
    if (req.user.role === 'VENDOR' && invoiceData.vendorId._id.toString() !== req.user.vendorId) {
      return sendError(res, 403, 'Access denied to this Invoice');
    }

    const { pdfBuffer, invoiceNumber } = await invoiceService.generatePdfStream(req.params.id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoiceNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    return res.end(pdfBuffer);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Invoice not found');
    throw err;
  }
});

export const sendInvoiceEmail = asyncHandler(async (req, res) => {
  try {
    const data = await invoiceService.sendInvoiceEmail(req.params.id, req.user.vendorId);
    return sendSuccess(res, 200, 'Invoice email sent successfully', data);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Invoice not found');
    if (err.message.startsWith('FORBIDDEN')) return sendError(res, 403, err.message);
    throw err;
  }
});
