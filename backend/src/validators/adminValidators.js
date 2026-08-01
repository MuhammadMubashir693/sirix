const { z } = require('zod');
const { objectId, passwordSchema } = require('./authValidators');

const paginationQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

// --- Users ---

const listUsers = {
  query: paginationQuery.extend({
    role: objectId.optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
};

const userIdParam = {
  params: z.object({ id: objectId }),
};

const createUser = {
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: passwordSchema,
    roleId: objectId,
    phone: z.string().optional(),
  }),
};

const updateUser = {
  params: z.object({ id: objectId }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    roleId: objectId.optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
};

const setUserStatus = {
  params: z.object({ id: objectId }),
  body: z.object({ isActive: z.boolean() }),
};

// --- Roles ---

const roleIdParam = {
  params: z.object({ id: objectId }),
};

const createRole = {
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    permissions: z.array(objectId).optional().default([]),
  }),
};

const updateRole = {
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    permissions: z.array(objectId).optional(),
  }),
};

// --- Permissions ---

const permissionIdParam = {
  params: z.object({ id: objectId }),
};

const createPermission = {
  body: z.object({
    module: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'Module must be lowercase, letters/numbers/hyphens only'),
    action: z.enum(['create', 'read', 'update', 'delete', 'manage', 'export']),
    description: z.string().optional(),
  }),
};

const updatePermission = {
  params: z.object({ id: objectId }),
  body: z.object({
    description: z.string().optional(),
  }),
};

// --- Audit logs ---

const listAuditLogs = {
  query: paginationQuery.extend({
    module: z.string().optional(),
    action: z.string().optional(),
    user: objectId.optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
};

const auditLogIdParam = {
  params: z.object({ id: objectId }),
};

// --- Settings ---

const settingKeyParam = {
  params: z.object({ key: z.string().min(1) }),
};

const settingBody = z.object({
  value: z.unknown(),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  group: z.string().min(1).default('general'),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

const upsertSetting = {
  params: z.object({ key: z.string().min(1) }),
  body: settingBody,
};

const bulkUpsertSettings = {
  body: z.object({
    settings: z
      .array(settingBody.extend({ key: z.string().min(1) }))
      .min(1, 'At least one setting is required'),
  }),
};

const listSettingsQuery = {
  query: z.object({ group: z.string().optional() }),
};

// --- Sessions ---

const listSessions = {
  query: paginationQuery.extend({
    userId: objectId.optional(),
  }),
};

const sessionIdParam = {
  params: z.object({ id: objectId }),
};

const revokeAllForUserParam = {
  params: z.object({ userId: objectId }),
};

module.exports = {
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
};
