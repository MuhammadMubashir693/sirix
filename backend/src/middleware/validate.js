const ApiError = require('../utils/ApiError');

/**
 * Validates req.body / req.query / req.params against a Zod schema shape:
 * { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = {};

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        errors.body = result.error.flatten().fieldErrors;
      } else {
        req.body = result.data;
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        errors.query = result.error.flatten().fieldErrors;
      } else {
        req.query = result.data;
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        errors.params = result.error.flatten().fieldErrors;
      } else {
        req.params = result.data;
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(ApiError.badRequest('Validation failed', errors));
    }

    return next();
  };
}

module.exports = validate;
