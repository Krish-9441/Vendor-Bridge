import express from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { uploadRfqAttachment } from '../../middleware/upload.middleware.js';
import * as rfqController from './rfq.controller.js';
import * as rfqValidation from './rfq.validation.js';

const router = express.Router();

router.use(verifyToken);

router.get(
  '/',
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  rfqValidation.getRfqsValidation,
  validateRequest,
  rfqController.getRfqs
);

router.get(
  '/:id',
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  rfqController.getRfqById
);

router.post(
  '/',
  requireRole(['PROCUREMENT_OFFICER', 'ADMIN']),
  rfqValidation.createRfqValidation,
  validateRequest,
  rfqController.createRfq
);

router.patch(
  '/:id',
  requireRole(['PROCUREMENT_OFFICER', 'ADMIN']),
  rfqValidation.updateRfqValidation,
  validateRequest,
  rfqController.updateRfq
);

router.post(
  '/:id/publish',
  requireRole(['PROCUREMENT_OFFICER', 'ADMIN']),
  rfqController.publishRfq
);

router.post(
  '/:id/attachments',
  requireRole(['PROCUREMENT_OFFICER', 'ADMIN']),
  uploadRfqAttachment.single('file'),
  rfqController.addAttachments
);

router.post(
  '/:id/vendors',
  requireRole(['PROCUREMENT_OFFICER', 'ADMIN']),
  rfqValidation.assignVendorsValidation,
  validateRequest,
  rfqController.assignVendors
);

router.post(
  '/:id/cancel',
  requireRole(['PROCUREMENT_OFFICER', 'ADMIN']),
  rfqValidation.cancelRfqValidation,
  validateRequest,
  rfqController.cancelRfq
);

router.get(
  '/:id/compare',
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']),
  rfqController.compareQuotations
);

export default router;
