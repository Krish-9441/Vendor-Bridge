import { body } from 'express-validator';

// ── Signup ────────────────────────────────────────────────
export const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['PROCUREMENT_OFFICER', 'VENDOR', 'MANAGER', 'ADMIN'])
    .withMessage('Invalid role. Must be one of: PROCUREMENT_OFFICER, VENDOR, MANAGER, ADMIN'),

  // Vendor-specific fields (required only when role is VENDOR)
  body('companyName')
    .if(body('role').equals('VENDOR'))
    .notEmpty().withMessage('Company name is required for vendor signup')
    .trim(),

  body('gstNumber')
    .if(body('role').equals('VENDOR'))
    .notEmpty().withMessage('GST number is required for vendor signup')
    .trim(),

  body('phone')
    .if(body('role').equals('VENDOR'))
    .notEmpty().withMessage('Phone is required for vendor signup')
    .trim(),

  body('category').optional().isString().trim(),
  body('contactName').optional().isString().trim(),
];

// ── Login ─────────────────────────────────────────────────
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Forgot Password ───────────────────────────────────────
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
];

// ── Reset Password ────────────────────────────────────────
export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];
