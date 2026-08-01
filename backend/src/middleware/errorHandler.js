const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../config/logger');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  // Normalize known non-ApiError failures into ApiError
  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const errors = Object.fromEntries(
        Object.entries(error.errors || {}).map(([key, val]) => [key, val.message])
      );
      error = ApiError.badRequest('Validation failed', errors);
    } else if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid value for field '${error.path}'`);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      error = ApiError.conflict(`Duplicate value for field '${field}'`, error.keyValue);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Invalid or expired token');
    } else {
      error = ApiError.internal(env.isProd ? 'An error occurred' : error.message);
    }
  }

  if (!error.isOperational) {
    logger.error(`${error.message}\n${err.stack}`);
  } else if (error.statusCode >= 500) {
    logger.error(error.message);
  }

  return ApiResponse.error(res, {
    message: error.message,
    errors: error.errors,
    statusCode: error.statusCode || 500,
  });
}

module.exports = errorHandler;
