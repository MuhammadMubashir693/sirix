const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const Role = require('../models/Role');
const ApiError = require('../utils/ApiError');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
} = require('../utils/token');
const env = require('../config/env');
const logger = require('../config/logger');

const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // fallback, mirrors JWT_REFRESH_EXPIRES_IN default

function buildTokenPair(user, meta = {}) {
  const payload = { sub: user._id.toString(), role: user.role?.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: user._id.toString() });
  return { accessToken, refreshToken, payload, meta };
}

async function persistRefreshToken(user, refreshToken, meta = {}) {
  const decoded = verifyRefreshToken(refreshToken);
  await refreshTokenRepository.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });
}

async function register({ firstName, lastName, email, password, roleId, phone }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  let role;
  if (roleId) {
    role = await Role.findById(roleId);
    if (!role) throw ApiError.badRequest('Invalid roleId');
  } else {
    role = await Role.findOne({ name: 'Viewer' });
    if (!role) throw ApiError.internal('Default Viewer role is not configured. Seed roles first.');
  }

  const user = await userRepository.create({
    firstName,
    lastName,
    email,
    password,
    role: role._id,
    phone,
  });

  const fullUser = await userRepository.findByIdWithRole(user._id);
  return fullUser;
}

async function login({ email, password }, meta = {}) {
  const user = await userRepository.findByEmail(email, { withPassword: true });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  if (!user.isActive) throw ApiError.unauthorized('Account is deactivated. Contact an administrator.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  const { accessToken, refreshToken } = buildTokenPair(user);
  await persistRefreshToken(user, refreshToken, meta);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${user.email}`);

  return { user: user.toSafeObject(), accessToken, refreshToken };
}

async function refresh(refreshTokenRaw, meta = {}) {
  if (!refreshTokenRaw) throw ApiError.unauthorized('Refresh token is required');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenRaw);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const tokenHash = hashToken(refreshTokenRaw);
  const stored = await refreshTokenRepository.findByHash(tokenHash);

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    // Reuse detection: if a revoked token is presented again, revoke the whole chain for safety
    if (stored?.revoked) {
      await refreshTokenRepository.revokeAllForUser(decoded.sub);
      logger.warn(`Refresh token reuse detected for user ${decoded.sub}. All sessions revoked.`);
    }
    throw ApiError.unauthorized('Refresh token is invalid, expired, or has been revoked');
  }

  const user = await userRepository.findByIdWithRole(decoded.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('User account is inactive or no longer exists');

  // Rotate: issue a new pair, revoke the old one, link the chain
  const { accessToken, refreshToken: newRefreshToken } = buildTokenPair(user);
  const newDecoded = verifyRefreshToken(newRefreshToken);

  await refreshTokenRepository.create({
    user: user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(newDecoded.exp * 1000),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });
  await refreshTokenRepository.revoke(tokenHash, hashToken(newRefreshToken));

  return { accessToken, refreshToken: newRefreshToken, user: user.toSafeObject() };
}

async function logout(refreshTokenRaw) {
  if (!refreshTokenRaw) return;
  const tokenHash = hashToken(refreshTokenRaw);
  await refreshTokenRepository.revoke(tokenHash);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.model.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.unauthorized('Current password is incorrect');

  user.password = newPassword;
  await user.save();

  // Force re-login everywhere else for security
  await refreshTokenRepository.revokeAllForUser(userId);
}

async function forgotPassword(email) {
  const user = await userRepository.findByEmail(email);
  // Always resolve silently to avoid leaking which emails are registered
  if (!user) {
    logger.info(`Password reset requested for unknown email: ${email}`);
    return { resetUrl: null };
  }

  const rawToken = generateRandomToken(32);
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashed;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.resetPasswordUrl}?token=${rawToken}`;
  // In production this would be dispatched via the mail queue (BullMQ) using nodemailer.
  logger.info(`Password reset link generated for ${email}: ${resetUrl}`);

  return { resetUrl };
}

async function resetPassword(rawToken, newPassword) {
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await userRepository.findByResetToken(hashed);

  if (!user) throw ApiError.badRequest('Password reset token is invalid or has expired');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await refreshTokenRepository.revokeAllForUser(user._id);
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  REFRESH_COOKIE_MAX_AGE_MS,
};
