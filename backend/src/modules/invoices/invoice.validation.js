import { body, param } from 'express-validator';

export const generateInvoiceValidation = [
  body('purchaseOrderId').isMongoId().withMessage('Valid purchaseOrderId is required'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be a percentage between 0 and 100')
];

export const updateInvoiceStatusValidation = [
  param('id').isMongoId().withMessage('Valid Invoice ID is required'),
  body('status')
    .isIn(['SENT', 'PAID', 'CANCELLED'])
    .withMessage('Status must be one of: SENT, PAID, CANCELLED'),
];
