const express = require('express');
const adminUserController = require('../controllers/adminUserController');
const roleController = require('../controllers/roleController');
const permissionController = require('../controllers/permissionController');
const auditLogController = require('../controllers/auditLogController');
const settingController = require('../controllers/settingController');
const sessionController = require('../controllers/sessionController');

const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const auditLogger = require('../middleware/auditLogger');
const { authorizePermission } = require('../middleware/authorize');

const {
  listUsers,
  userIdParam,
  createUser,
  updateUser,
  setUserStatus,
  roleIdParam,
  createRole,
  updateRole,
  permissionIdParam,
  createPermission,
  updatePermission,
  listAuditLogs,
  auditLogIdParam,
  settingKeyParam,
  upsertSetting,
  bulkUpsertSettings,
  listSettingsQuery,
  listSessions,
  sessionIdParam,
  revokeAllForUserParam,
} = require('../validators/adminValidators');

const router = express.Router();

// Every route in this module requires a valid access token; individual routes
// further restrict by permission key (see the seeded permission matrix).
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Users, roles, permissions, audit logs, settings, and session management
 */

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List users (paginated, searchable, filterable)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated list of users
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: User created
 */
router.get('/users', authorizePermission('users:read'), validate(listUsers), adminUserController.list);
router.post(
  '/users',
  authorizePermission('users:create'),
  validate(createUser),
  auditLogger('ADMIN', 'USER_CREATE'),
  adminUserController.create
);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User details
 *   put:
 *     summary: Update a user
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Soft-delete a user
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User deleted
 */
router.get('/users/:id', authorizePermission('users:read'), validate(userIdParam), adminUserController.getById);
router.put(
  '/users/:id',
  authorizePermission('users:update'),
  validate(updateUser),
  auditLogger('ADMIN', 'USER_UPDATE'),
  adminUserController.update
);
router.delete(
  '/users/:id',
  authorizePermission('users:delete'),
  validate(userIdParam),
  auditLogger('ADMIN', 'USER_DELETE'),
  adminUserController.remove
);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch(
  '/users/:id/status',
  authorizePermission('users:update'),
  validate(setUserStatus),
  auditLogger('ADMIN', 'USER_STATUS_CHANGE'),
  adminUserController.setStatus
);

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: List all roles with their permissions
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of roles
 *   post:
 *     summary: Create a new role
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Role created
 */
router.get('/roles', authorizePermission('roles:read'), roleController.list);
router.post(
  '/roles',
  authorizePermission('roles:create'),
  validate(createRole),
  auditLogger('ADMIN', 'ROLE_CREATE'),
  roleController.create
);

/**
 * @swagger
 * /admin/roles/{id}:
 *   get:
 *     summary: Get a single role by ID
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Role details
 *   put:
 *     summary: Update a role's name, description, or permissions
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Role updated
 *   delete:
 *     summary: Soft-delete a non-system role
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Role deleted
 */
router.get('/roles/:id', authorizePermission('roles:read'), validate(roleIdParam), roleController.getById);
router.put(
  '/roles/:id',
  authorizePermission('roles:update'),
  validate(updateRole),
  auditLogger('ADMIN', 'ROLE_UPDATE'),
  roleController.update
);
router.delete(
  '/roles/:id',
  authorizePermission('roles:delete'),
  validate(roleIdParam),
  auditLogger('ADMIN', 'ROLE_DELETE'),
  roleController.remove
);

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /admin/permissions:
 *   get:
 *     summary: List the full permission catalog
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of permissions
 *   post:
 *     summary: Create a custom permission
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Permission created
 */
router.get('/permissions', authorizePermission('permissions:read'), permissionController.list);
router.post(
  '/permissions',
  authorizePermission('permissions:create'),
  validate(createPermission),
  auditLogger('ADMIN', 'PERMISSION_CREATE'),
  permissionController.create
);

/**
 * @swagger
 * /admin/permissions/{id}:
 *   get:
 *     summary: Get a single permission by ID
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Permission details
 *   put:
 *     summary: Update a permission's description
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Permission updated
 *   delete:
 *     summary: Delete a permission not currently assigned to any role
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Permission deleted
 */
router.get(
  '/permissions/:id',
  authorizePermission('permissions:read'),
  validate(permissionIdParam),
  permissionController.getById
);
router.put(
  '/permissions/:id',
  authorizePermission('permissions:update'),
  validate(updatePermission),
  auditLogger('ADMIN', 'PERMISSION_UPDATE'),
  permissionController.update
);
router.delete(
  '/permissions/:id',
  authorizePermission('permissions:delete'),
  validate(permissionIdParam),
  auditLogger('ADMIN', 'PERMISSION_DELETE'),
  permissionController.remove
);

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: List audit log entries (paginated, filterable by module/action/user/date range)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated list of audit log entries
 */
router.get(
  '/audit-logs',
  authorizePermission('audit-logs:read'),
  validate(listAuditLogs),
  auditLogController.list
);

/**
 * @swagger
 * /admin/audit-logs/{id}:
 *   get:
 *     summary: Get a single audit log entry by ID
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Audit log entry details
 */
router.get(
  '/audit-logs/:id',
  authorizePermission('audit-logs:read'),
  validate(auditLogIdParam),
  auditLogController.getById
);

// ---------------------------------------------------------------------------
// System settings
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: List system settings, optionally filtered by group
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of settings
 *   put:
 *     summary: Bulk create/update settings
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Settings saved
 */
router.get(
  '/settings',
  authorizePermission('settings:read'),
  validate(listSettingsQuery),
  settingController.list
);
router.put(
  '/settings',
  authorizePermission('settings:update'),
  validate(bulkUpsertSettings),
  auditLogger('ADMIN', 'SETTINGS_BULK_UPDATE'),
  settingController.bulkUpsert
);

/**
 * @swagger
 * /admin/settings/{key}:
 *   get:
 *     summary: Get a single setting by key
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Setting details
 *   put:
 *     summary: Create or update a single setting
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Setting saved
 *   delete:
 *     summary: Delete a setting
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Setting deleted
 */
router.get(
  '/settings/:key',
  authorizePermission('settings:read'),
  validate(settingKeyParam),
  settingController.getByKey
);
router.put(
  '/settings/:key',
  authorizePermission('settings:update'),
  validate(upsertSetting),
  auditLogger('ADMIN', 'SETTING_UPDATE'),
  settingController.upsert
);
router.delete(
  '/settings/:key',
  authorizePermission('settings:delete'),
  validate(settingKeyParam),
  auditLogger('ADMIN', 'SETTING_DELETE'),
  settingController.remove
);

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /admin/sessions:
 *   get:
 *     summary: List active user sessions (refresh tokens), optionally filtered by userId
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated list of active sessions
 */
router.get('/sessions', authorizePermission('sessions:read'), validate(listSessions), sessionController.list);

/**
 * @swagger
 * /admin/sessions/{id}:
 *   delete:
 *     summary: Revoke a single session
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Session revoked
 */
router.delete(
  '/sessions/:id',
  authorizePermission('sessions:delete'),
  validate(sessionIdParam),
  auditLogger('ADMIN', 'SESSION_REVOKE'),
  sessionController.revoke
);

/**
 * @swagger
 * /admin/sessions/user/{userId}:
 *   delete:
 *     summary: Revoke all sessions for a specific user
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All sessions revoked for the user
 */
router.delete(
  '/sessions/user/:userId',
  authorizePermission('sessions:delete'),
  validate(revokeAllForUserParam),
  auditLogger('ADMIN', 'SESSION_REVOKE_ALL'),
  sessionController.revokeAllForUser
);

module.exports = router;
