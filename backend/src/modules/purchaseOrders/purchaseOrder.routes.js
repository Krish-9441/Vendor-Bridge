import express from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import * as poController from './purchaseOrder.controller.js';
import * as poValidation from './purchaseOrder.validation.js';

const router = express.Router();

router.get(
  '/',
  verifyToken,
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  poController.getPurchaseOrders
);

router.get(
  '/:id',
  verifyToken,
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  poController.getPurchaseOrderById
);

router.get(
  '/:id/pdf',
  verifyToken,
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  poController.generatePdf
);

router.post(
  '/',
  verifyToken,
  requireRole(['PROCUREMENT_OFFICER', 'ADMIN']),
  poValidation.generatePoValidation,
  validateRequest,
  poController.generatePo
);

router.patch(
  '/:id/status',
  verifyToken,
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  poValidation.updatePoStatusValidation,
  validateRequest,
  poController.updatePoStatus
);

export default router;
