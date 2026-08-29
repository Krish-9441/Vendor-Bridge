import jwt from 'jsonwebtoken';
import { sendError } from '../shared/utils/apiResponse.js';

// ── verifyToken ───────────────────────────────────────────────────────────────
// Validates Bearer access token and attaches decoded payload to req.user
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access token required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { sub, email, role, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Access token has expired');
    }
    return sendError(res, 401, 'Invalid access token');
  }
};

// ── requireRole ───────────────────────────────────────────────────────────────
// Role-based access control middleware factory
// Usage: requireRole('admin') or requireRole(['admin', 'manager'])
export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log('Access denied. req.user:', req.user, 'allowedRoles:', allowedRoles);
      return sendError(
        res,
        403,
        `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};
