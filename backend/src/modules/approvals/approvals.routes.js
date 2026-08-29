import express from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import * as approvalsController from './approvals.controller.js';
import * as approvalsValidation from './approvals.validation.js';

const router = express.Router();

router.get(
  '/',
  verifyToken,
  requireRole(['MANAGER', 'ADMIN', 'PROCUREMENT_OFFICER']),
  approvalsValidation.getApprovalsValidation,
  validateRequest,
  approvalsController.getApprovals
);

router.get(
  '/:id',
  verifyToken,
  requireRole(['MANAGER', 'ADMIN', 'PROCUREMENT_OFFICER']),
  approvalsValidation.getApprovalByIdValidation,
  validateRequest,
  approvalsController.getApprovalById
);

router.post(
  '/:id/approve',
  verifyToken,
  requireRole(['MANAGER', 'ADMIN']),
  approvalsValidation.approveQuotationValidation,
  validateRequest,
  approvalsController.approveQuotation
);

router.post(
  '/:id/reject',
  verifyToken,
  requireRole(['MANAGER', 'ADMIN']),
  approvalsValidation.rejectQuotationValidation,
  validateRequest,
  approvalsController.rejectQuotation
);

export default router;
