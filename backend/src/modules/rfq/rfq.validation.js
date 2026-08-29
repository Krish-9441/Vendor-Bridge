import { body, query } from 'express-validator';
import mongoose from 'mongoose';

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// ── GET /rfqs Query Validation ───────────────────────────────────────────────
export const getRfqsValidation = [
  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED'])
    .withMessage('Invalid status'),
  query('createdBy').optional().custom(isObjectId).withMessage('Invalid createdBy ID'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isString().trim(),
  query('sortOrder').optional().isIn(['asc', 'desc']).trim(),
];

// ── POST /rfqs Body Validation ──────────────────────────────────────────────
export const createRfqValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString().trim(),
  body('itemDetails')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('itemDetails.*.name')
    .trim().notEmpty().withMessage('Item name is required'),
  body('itemDetails.*.quantity')
    .isNumeric().withMessage('Item quantity must be a number'),
  body('itemDetails.*.unit')
    .trim().notEmpty().withMessage('Item unit is required'),
  body('itemDetails.*.specification')
    .optional().isString().trim(),
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid ISO8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  body('vendorIds')
    .optional()
    .isArray().withMessage('vendorIds must be an array')
    .custom((value, { req }) => {
      if (req.body.publish && (!value || value.length < 1)) {
        throw new Error('At least one vendor must be assigned to publish an RFQ');
      }
      if (value && value.some((id) => !isObjectId(id))) {
        throw new Error('Invalid vendor ID in vendorIds');
      }
      return true;
    }),
  body('publish').optional().isBoolean().toBoolean(),
];

// ── PATCH /rfqs/:id Body Validation ─────────────────────────────────────────
export const updateRfqValidation = [
  body('title').optional().isString().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString().trim(),
  body('itemDetails').optional().isArray(),
  body('itemDetails.*.name').optional().isString().trim().notEmpty(),
  body('itemDetails.*.quantity').optional().isNumeric(),
  body('itemDetails.*.unit').optional().isString().trim().notEmpty(),
  body('itemDetails.*.specification').optional().isString().trim(),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid ISO8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
];

// ── POST /rfqs/:id/vendors Body Validation ──────────────────────────────────
export const assignVendorsValidation = [
  body('vendorIds')
    .isArray({ min: 1 }).withMessage('vendorIds array is required and cannot be empty')
    .custom((value) => {
      if (value.some((id) => !isObjectId(id))) {
        throw new Error('Invalid vendor ID in vendorIds');
      }
      return true;
    }),
];

// ── POST /rfqs/:id/cancel Body Validation ───────────────────────────────────
export const cancelRfqValidation = [
  body('reason').trim().notEmpty().withMessage('Cancellation reason is required'),
];
