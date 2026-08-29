import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RefreshToken, PasswordReset } from './auth.model.js';
import { User } from '../user/user.model.js';
import { Vendor } from '../vendors/vendor.model.js';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in ms

// ── Password Hashing ──────────────────────────────────────────────────────────

export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

// ── JWT Token Generation ──────────────────────────────────────────────────────

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      vendorId: user.vendorId || null,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

export const generateRefreshToken = async (userId, meta = {}) => {
  const rawToken = crypto.randomBytes(64).toString('hex');

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await RefreshToken.create({
    token: rawToken,
    userId,
    expiresAt,
    userAgent: meta.userAgent || null,
    ipAddress: meta.ipAddress || null,
  });

  return rawToken;
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

// ── Refresh Token Rotation ────────────────────────────────────────────────────

export const rotateRefreshToken = async (oldToken, meta = {}) => {
  const storedToken = await RefreshToken.findOne({ token: oldToken, revoked: false });

  if (!storedToken) {
    throw new Error('Invalid or revoked refresh token');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error('Refresh token has expired');
  }

  // Revoke the old token
  storedToken.revoked = true;
  storedToken.revokedAt = new Date();
  await storedToken.save();

  // Issue a new refresh token
  const newToken = await generateRefreshToken(storedToken.userId, meta);

  return { userId: storedToken.userId, newToken };
};

// ── Logout ────────────────────────────────────────────────────────────────────

export const revokeRefreshToken = async (token) => {
  const storedToken = await RefreshToken.findOne({ token });
  if (storedToken && !storedToken.revoked) {
    storedToken.revoked = true;
    storedToken.revokedAt = new Date();
    await storedToken.save();
  }
};

// ── Signup ────────────────────────────────────────────────────────────────────

export const createUser = async ({ name, email, password, role, companyName, gstNumber, category, contactName, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already in use');
  }

  const passwordHash = await hashPassword(password);
  
  let vendor = null;
  if (role === 'VENDOR') {
    const existingVendor = await Vendor.findOne({ gstNumber });
    if (existingVendor) {
      throw new Error('GST Number already exists');
    }
    vendor = await Vendor.create({
      companyName,
      gstNumber,
      category,
      contactName: contactName || name,
      contactEmail: email,
      contactPhone: phone,
      status: 'PENDING'
    });
  }

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || 'PROCUREMENT_OFFICER',
    vendorId: vendor ? vendor._id : null,
  });

  return { user, vendor };
};

// ── Login ─────────────────────────────────────────────────────────────────────

export const validateCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return null;

  return user;
};

// ── Forgot Password ───────────────────────────────────────────────────────────

export const createPasswordResetToken = async (email) => {
  const user = await User.findOne({ email });

  // Always return success to prevent user enumeration
  if (!user) return null;

  // Invalidate any existing tokens for this user
  await PasswordReset.deleteMany({ userId: user._id });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await PasswordReset.create({
    token: rawToken,
    userId: user._id,
    expiresAt,
  });

  return { user, resetToken: rawToken };
};

// ── Reset Password ────────────────────────────────────────────────────────────

export const resetUserPassword = async (token, newPassword) => {
  const resetDoc = await PasswordReset.findOne({ token, used: false });

  if (!resetDoc) {
    throw new Error('Invalid or expired reset token');
  }

  if (resetDoc.expiresAt < new Date()) {
    throw new Error('Reset token has expired');
  }

  const passwordHash = await hashPassword(newPassword);

  await User.findByIdAndUpdate(resetDoc.userId, { passwordHash });

  // Mark token as used
  resetDoc.used = true;
  resetDoc.usedAt = new Date();
  await resetDoc.save();

  // Revoke all refresh tokens for this user (force re-login)
  await RefreshToken.updateMany(
    { userId: resetDoc.userId, revoked: false },
    { revoked: true, revokedAt: new Date() }
  );

  return true;
};
