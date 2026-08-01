const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

function createRateLimiter({ windowMs = env.rateLimit.windowMs, max = env.rateLimit.max, message } = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return ApiResponse.error(res, {
        message: message || 'Too many requests, please try again later',
        statusCode: 429,
      });
    },
  });
}

// Stricter limiter specifically for auth endpoints (login/register/forgot-password) to slow brute force
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later',
});

module.exports = { createRateLimiter, authLimiter };
