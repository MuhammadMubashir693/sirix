const ApiError = require('../utils/ApiError');

/**
 * Role-based guard. Usage: authorizeRoles('Admin', 'Manager')
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(ApiError.forbidden('No role assigned to user'));
    }
    const roleName = req.user.role.name;
    if (!allowedRoles.includes(roleName)) {
      return next(ApiError.forbidden(`Role '${roleName}' is not permitted to perform this action`));
    }
    return next();
  };
}

/**
 * Permission-based guard. Usage: authorizePermission('invoices:create')
 * Admin role bypasses all permission checks.
 */
function authorizePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(ApiError.forbidden('No role assigned to user'));
    }

    if (req.user.role.name === 'Admin') return next();

    const userPermissionKeys = (req.user.role.permissions || []).map((p) => p.key);
    const hasAll = requiredPermissions.every((perm) => userPermissionKeys.includes(perm));

    if (!hasAll) {
      return next(ApiError.forbidden('Insufficient permissions for this action'));
    }
    return next();
  };
}

module.exports = { authorizeRoles, authorizePermission };
