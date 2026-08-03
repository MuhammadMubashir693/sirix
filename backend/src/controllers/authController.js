const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const authService = require('../services/authService');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'strict', // was always 'strict'
    path: `${env.apiPrefix}/auth`,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function requestMeta(req) {
  return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
}

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  return ApiResponse.success(res, {
    message: 'User registered successfully',
    data: user.toSafeObject ? user.toSafeObject() : user,
    statusCode: 201,
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, requestMeta(req));
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return ApiResponse.success(res, {
    message: 'Login successful',
    data: { user, accessToken, refreshToken },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
  const tokenFromBody = req.body?.refreshToken;
  const { accessToken, refreshToken, user } = await authService.refresh(
    tokenFromCookie || tokenFromBody,
    requestMeta(req)
  );
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return ApiResponse.success(res, {
    message: 'Token refreshed successfully',
    data: { user, accessToken, refreshToken },
  });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: `${env.apiPrefix}/auth` });
  return ApiResponse.success(res, { message: 'Logged out successfully' });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  return ApiResponse.success(res, { message: 'Password changed successfully' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { resetUrl } = await authService.forgotPassword(req.body.email);
  return ApiResponse.success(res, {
    message: 'If that email is registered, a password reset link has been sent',
    // resetUrl only ever included in non-production for local testing convenience
    data: env.isProd ? null : { resetUrl },
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  return ApiResponse.success(res, { message: 'Password has been reset successfully' });
});

const me = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, {
    message: 'Current user fetched',
    data: req.user.toSafeObject(),
  });
});

module.exports = { register, login, refresh, logout, changePassword, forgotPassword, resetPassword, me };
