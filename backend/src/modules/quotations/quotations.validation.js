import { body, query } from 'express-validator';
import mongoose from 'mongoose';

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// ── GET /quotations Query Validation ──────────────────────────────────────────
export const getQuotationsValidation = [
  query('rfqId').optional().custom(isObjectId).withMessage('Invalid rfqId'),
  query('vendorId').optional().custom(isObjectId).withMessage('Invalid vendorId'),
  query('status')
    .optional()
    .isIn(['SUBMITTED', 'WITHDRAWN', 'SELECTED', 'REJECTED'])
    .withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isString().trim(),
  query('sortOrder').optional().isIn(['asc', 'desc']).trim(),
];

// ── POST /quotations Body Validation ──────────────────────────────────────────
export const createQuotationValidation = [
  body('rfqId')
    .notEmpty().withMessage('rfqId is required')
    .custom(isObjectId).withMessage('Invalid rfqId'),
  body('unitPrice')
    .isNumeric().withMessage('unitPrice must be a number')
    .custom((value) => value > 0).withMessage('unitPrice must be greater than 0'),
  body('quantity')
    .isNumeric().withMessage('quantity must be a number')
    .custom((value) => value > 0).withMessage('quantity must be greater than 0'),
  body('deliveryDays')
    .isInt({ min: 1 }).withMessage('deliveryDays must be an integer greater than 0'),
  body('remarks')
    .optional()
    .isString().trim(),
];

// ── PATCH /quotations/:id Body Validation ─────────────────────────────────────
export const updateQuotationValidation = [
  body('unitPrice')
    .optional()
    .isNumeric().withMessage('unitPrice must be a number')
    .custom((value) => value > 0).withMessage('unitPrice must be greater than 0'),
  body('quantity')
    .optional()
    .isNumeric().withMessage('quantity must be a number')
    .custom((value) => value > 0).withMessage('quantity must be greater than 0'),
  body('deliveryDays')
    .optional()
    .isInt({ min: 1 }).withMessage('deliveryDays must be an integer greater than 0'),
  body('remarks')
    .optional()
    .isString().trim(),
];
