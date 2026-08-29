import rateLimit from 'express-rate-limit';
import { sendError } from '../shared/utils/apiResponse.js';

const rateLimitHandler = (req, res) => {
  return sendError(res, 429, 'Too many requests, please try again later');
};

// ── Login: 50 requests per 15 minutes per IP (relaxed for dev, tighten in prod) ─
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Signup: 50 requests per hour per IP (relaxed for dev, tighten in prod) ───
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Forgot Password: 20 requests per 15 minutes per IP (relaxed for dev) ─────
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 3 : 20,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});
