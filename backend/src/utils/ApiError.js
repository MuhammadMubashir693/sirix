class ApiError extends Error {
  constructor(statusCode, message, errors = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors = null) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized', errors = null) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = 'Forbidden', errors = null) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = 'Resource not found', errors = null) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = 'Conflict', errors = null) {
    return new ApiError(409, message, errors);
  }

  static internal(message = 'Internal Server Error', errors = null) {
    return new ApiError(500, message, errors, false);
  }
}

module.exports = ApiError;
