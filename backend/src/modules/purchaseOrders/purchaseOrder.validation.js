import { body, param } from 'express-validator';

export const generatePoValidation = [
  body('approvalId').isMongoId().withMessage('Valid approvalId is required'),
];

export const updatePoStatusValidation = [
  param('id').isMongoId().withMessage('Valid PO ID is required'),
  body('status')
    .isIn(['ACKNOWLEDGED', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be one of: ACKNOWLEDGED, COMPLETED, CANCELLED'),
];
