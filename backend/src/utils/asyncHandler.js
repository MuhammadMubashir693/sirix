/**
 * Wraps an async controller/middleware fn and forwards rejected promises to next(err)
 * so a single global error handler can process them.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
