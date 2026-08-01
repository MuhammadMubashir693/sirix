const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

/**
 * Usage: router.post('/', auditLogger('AUTH', 'USER_LOGIN'), controller.login)
 * Fires after the response finishes so it never blocks or fails the request.
 */
function auditLogger(module, action) {
  return (req, res, next) => {
    res.on('finish', () => {
      AuditLog.create({
        user: req.user?._id,
        action,
        module,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        resourceId: req.params?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch((err) => logger.error(`Failed to write audit log: ${err.message}`));
    });
    next();
  };
}

module.exports = auditLogger;
