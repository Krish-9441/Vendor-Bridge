import { body, query, param } from 'express-validator';

export const getApprovalsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']).withMessage('Invalid status'),
  query('rfqId').optional().isMongoId().withMessage('Invalid RFQ ID format')
];

export const getApprovalByIdValidation = [
  param('id').isMongoId().withMessage('Invalid approval ID format')
];

export const approveQuotationValidation = [
  param('id').isMongoId().withMessage('Invalid approval ID format'),
  body('remarks').optional().isString().trim()
];

export const rejectQuotationValidation = [
  param('id').isMongoId().withMessage('Invalid approval ID format'),
  body('remarks').notEmpty().withMessage('Remarks are required for rejection').isString().trim()
];
