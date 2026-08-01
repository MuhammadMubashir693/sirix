/**
 * Standard response envelope used across every endpoint:
 * { success, message, data, pagination, errors }
 */
class ApiResponse {
  static success(res, { message = 'Success', data = null, pagination = null, statusCode = 200 } = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
      errors: null,
    });
  }

  static error(res, { message = 'An error occurred', errors = null, statusCode = 500 } = {}) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      pagination: null,
      errors,
    });
  }
}

module.exports = ApiResponse;
