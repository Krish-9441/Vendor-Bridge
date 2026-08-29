import express from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import * as vendorController from './vendors.controller.js';
import * as vendorValidation from './vendors.validation.js';

const router = express.Router();

router.use(verifyToken);

router.get(
  '/',
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  vendorValidation.getVendorsValidation,
  validateRequest,
  vendorController.getVendors
);

router.get(
  '/:id',
  requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  vendorController.getVendorById
);

router.post(
  '/',
  requireRole(['PROCUREMENT_OFFICER', 'ADMIN']),
  vendorValidation.createVendorValidation,
  validateRequest,
  vendorController.createVendor
);

router.patch(
  '/:id',
  requireRole(['ADMIN', 'VENDOR']),
  vendorValidation.updateVendorValidation,
  validateRequest,
  vendorController.updateVendor
);

router.patch(
  '/:id/status',
  requireRole(['ADMIN']),
  vendorValidation.updateVendorStatusValidation,
  validateRequest,
  vendorController.updateVendorStatus
);

export default router;
