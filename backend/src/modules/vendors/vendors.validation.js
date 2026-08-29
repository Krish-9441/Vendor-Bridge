import { body, query } from 'express-validator';

// ── GET /vendors Query Validation ───────────────────────────────────────────
export const getVendorsValidation = [
  query('status')
    .optional()
    .isIn(['PENDING', 'ACTIVE', 'INACTIVE'])
    .withMessage('Invalid status'),
  query('category').optional().isString().trim(),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isString().trim(),
  query('sortOrder').optional().isIn(['asc', 'desc']).trim(),
];

// ── POST /vendors Body Validation ───────────────────────────────────────────
export const createVendorValidation = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('gstNumber')
    .trim()
    .notEmpty().withMessage('GST number is required')
    .isLength({ min: 15, max: 15 }).withMessage('GST number must be 15 characters long'),
  body('category').optional().isString().trim(),
  body('contactName').optional().isString().trim(),
  body('contactEmail')
    .trim()
    .notEmpty().withMessage('Contact email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
  body('address').optional().isString().trim(),
];

// ── PATCH /vendors/:id Body Validation ──────────────────────────────────────
export const updateVendorValidation = [
  body('contactName').optional().isString().trim(),
  body('contactEmail')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('contactPhone').optional().isString().trim(),
  body('address').optional().isString().trim(),
  // Vendor cannot update companyName, gstNumber, or status via this route.
  // If Admin wants to update those, we could allow it, but spec says:
  // "Vendor (own contactName/contactEmail/contactPhone/address only — enforced server-side)"
];

// ── PATCH /vendors/:id/status Body Validation ────────────────────────────────
export const updateVendorStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['PENDING', 'ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];
