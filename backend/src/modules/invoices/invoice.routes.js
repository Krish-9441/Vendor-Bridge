import express from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import * as invoiceController from './invoice.controller.js';
import * as invoiceValidation from './invoice.validation.js';

const router = express.Router();

router.get(
  '/',
  verifyToken,
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  invoiceController.getInvoices
);

router.get(
  '/:id',
  verifyToken,
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  invoiceController.getInvoiceById
);

router.get(
  '/:id/pdf',
  verifyToken,
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  invoiceController.generatePdf
);

router.post(
  '/',
  verifyToken,
  requireRole(['VENDOR']),
  invoiceValidation.generateInvoiceValidation,
  validateRequest,
  invoiceController.generateInvoice
);

router.post(
  '/:id/send',
  verifyToken,
  requireRole(['VENDOR']),
  invoiceController.sendInvoiceEmail
);

router.patch(
  '/:id/status',
  verifyToken,
  requireRole(['MANAGER', 'ADMIN']),
  invoiceValidation.updateInvoiceStatusValidation,
  validateRequest,
  invoiceController.updateInvoiceStatus
);

export default router;
