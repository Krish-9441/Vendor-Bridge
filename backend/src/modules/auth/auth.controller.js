import { validationResult } from 'express-validator';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { User } from '../user/user.model.js';
import {
  createUser,
  validateCredentials,
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  createPasswordResetToken,
  resetUserPassword,
  verifyAccessToken,
} from './auth.service.js';

// Cookie options for the httpOnly refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getMeta = (req) => ({
  userAgent: req.headers['user-agent'] || null,
  ipAddress: req.ip || null,
});

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }
  return null;
};

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
export const signup = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { name, email, password, role, companyName, gstNumber, category, contactName, phone } = req.body;
    const { user, vendor } = await createUser({ name, email, password, role, companyName, gstNumber, category, contactName, phone });

    const responseData = { user: user.toSafeObject() };
    if (vendor) {
      responseData.vendor = {
        id: vendor._id,
        companyName: vendor.companyName,
        status: vendor.status
      };
    }

    return sendSuccess(res, 201, 'Account created successfully', responseData);
  } catch (error) {
    if (error.message === 'Email already in use') {
      return sendError(res, 409, 'Email already in use');
    }
    if (error.message === 'GST Number already exists') {
      return sendError(res, 409, 'GST Number already exists');
    }
    console.error('[signup]', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { email, password } = req.body;

    const user = await validateCredentials(email, password);
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated');
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user._id, getMeta(req));

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    return sendSuccess(res, 200, 'Login successful', {
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('[login]', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
export const refresh = async (req, res) => {
  try {
    const oldToken = req.cookies?.refreshToken;
    if (!oldToken) {
      return sendError(res, 401, 'No refresh token provided');
    }

    const { userId, newToken } = await rotateRefreshToken(oldToken, getMeta(req));

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return sendError(res, 401, 'User not found or deactivated');
    }

    const accessToken = generateAccessToken(user);

    res.cookie('refreshToken', newToken, REFRESH_COOKIE_OPTIONS);

    return sendSuccess(res, 200, 'Token refreshed', { accessToken });
  } catch (error) {
    console.error('[refresh]', error);
    return sendError(res, 401, error.message || 'Token refresh failed');
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await revokeRefreshToken(token);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    console.error('[logout]', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    // req.user is populated by auth.middleware.js
    const user = await User.findById(req.user.sub).select('-passwordHash');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'User profile retrieved', { user });
  } catch (error) {
    console.error('[getMe]', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { email } = req.body;
    const result = await createPasswordResetToken(email);

    // Always return 200 to prevent user enumeration
    if (!result) {
      return sendSuccess(res, 200, 'If that email exists, a reset link has been sent');
    }

    // In production, send email here via a mail service
    // For development, return the token directly
    const responseData =
      process.env.NODE_ENV !== 'production' ? { resetToken: result.resetToken } : {};

    return sendSuccess(
      res,
      200,
      'If that email exists, a reset link has been sent',
      responseData
    );
  } catch (error) {
    console.error('[forgotPassword]', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ── POST /api/auth/reset-password ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { token, password } = req.body;
    await resetUserPassword(token, password);

    return sendSuccess(res, 200, 'Password reset successful. Please log in again.');
  } catch (error) {
    if (
      error.message === 'Invalid or expired reset token' ||
      error.message === 'Reset token has expired'
    ) {
      return sendError(res, 400, error.message);
    }
    console.error('[resetPassword]', error);
    return sendError(res, 500, 'Internal server error');
  }
};
