import { sendError } from '../shared/utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[GlobalError]', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      }
    });
  }
  
  if (err.message && err.message.includes('NOT_FOUND')) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: err.message.replace('NOT_FOUND: ', ''),
      }
    });
  }

  if (err.message && err.message.includes('FORBIDDEN')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: err.message.replace('FORBIDDEN: ', ''),
      }
    });
  }

  if (err.code === 11000) {
    // MongoDB Duplicate Key Error
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Duplicate record found',
      }
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    }
  });
};
