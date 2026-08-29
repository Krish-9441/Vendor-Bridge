import { Router } from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from './auth.controller.js';
import {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from './auth.validation.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import {
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
} from '../../middleware/rateLimiter.middleware.js';

const router = Router();

// Public routes
router.post('/signup', signupLimiter, signupValidation, signup);
router.post('/login', loginLimiter, loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Protected routes
router.get('/me', verifyToken, getMe);

export default router;
