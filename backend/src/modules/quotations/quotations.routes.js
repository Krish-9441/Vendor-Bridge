import express from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import * as quotationController from './quotations.controller.js';
import * as quotationValidation from './quotations.validation.js';

const router = express.Router();

router.use(verifyToken);

router.get(
  '/',
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  quotationValidation.getQuotationsValidation,
  validateRequest,
  quotationController.getQuotations
);

router.get(
  '/:id',
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  quotationController.getQuotationById
);

router.post(
  '/',
  requireRole(['VENDOR']),
  quotationValidation.createQuotationValidation,
  validateRequest,
  quotationController.createQuotation
);

router.patch(
  '/:id',
  requireRole(['VENDOR']),
  quotationValidation.updateQuotationValidation,
  validateRequest,
  quotationController.updateQuotation
);

router.post(
  '/:id/withdraw',
  requireRole(['VENDOR']),
  quotationController.withdrawQuotation
);

router.post(
  '/:id/select',
  requireRole(['PROCUREMENT_OFFICER', 'ADMIN']),
  quotationController.selectQuotation
);

export default router;
