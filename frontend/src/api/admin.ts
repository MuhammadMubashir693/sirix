import { apiRequest, apiRequestFull } from '@/lib/apiClient';
import type {
  User,
  Role,
  Permission,
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  AdminListUsersParams,
  CreateRolePayload,
  UpdateRolePayload,
  CreatePermissionPayload,
  UpdatePermissionPayload,
  AuditLogEntry,
  AuditLogListParams,
  SystemSetting,
  UpsertSettingPayload,
  UserSession,
  ListSessionsParams,
  AdminListResult,
} from '@/types';

export const adminUsersApi = {
  list: async (params: AdminListUsersParams) => {
    const res = await apiRequestFull<User[]>({ method: 'GET', url: '/admin/users', params });
    return { items: res.data ?? [], pagination: res.pagination! } as AdminListResult<User>;
  },

  getById: (id: string) => apiRequest<User>({ method: 'GET', url: `/admin/users/${id}` }),

  create: (payload: AdminCreateUserPayload) =>
    apiRequest<User>({ method: 'POST', url: '/admin/users', data: payload }),

  update: (id: string, payload: AdminUpdateUserPayload) =>
    apiRequest<User>({ method: 'PUT', url: `/admin/users/${id}`, data: payload }),

  setStatus: (id: string, isActive: boolean) =>
    apiRequest<User>({ method: 'PATCH', url: `/admin/users/${id}/status`, data: { isActive } }),

  remove: (id: string) => apiRequest<null>({ method: 'DELETE', url: `/admin/users/${id}` }),
};

export const adminRolesApi = {
  list: () => apiRequest<Role[]>({ method: 'GET', url: '/admin/roles' }),

  getById: (id: string) => apiRequest<Role>({ method: 'GET', url: `/admin/roles/${id}` }),

  create: (payload: CreateRolePayload) => apiRequest<Role>({ method: 'POST', url: '/admin/roles', data: payload }),

  update: (id: string, payload: UpdateRolePayload) =>
    apiRequest<Role>({ method: 'PUT', url: `/admin/roles/${id}`, data: payload }),

  remove: (id: string) => apiRequest<null>({ method: 'DELETE', url: `/admin/roles/${id}` }),
};

export const adminPermissionsApi = {
  list: () => apiRequest<Permission[]>({ method: 'GET', url: '/admin/permissions' }),

  create: (payload: CreatePermissionPayload) =>
    apiRequest<Permission>({ method: 'POST', url: '/admin/permissions', data: payload }),

  update: (id: string, payload: UpdatePermissionPayload) =>
    apiRequest<Permission>({ method: 'PUT', url: `/admin/permissions/${id}`, data: payload }),

  remove: (id: string) => apiRequest<null>({ method: 'DELETE', url: `/admin/permissions/${id}` }),
};

export const adminAuditLogsApi = {
  list: async (params: AuditLogListParams) => {
    const res = await apiRequestFull<AuditLogEntry[]>({ method: 'GET', url: '/admin/audit-logs', params });
    return { items: res.data ?? [], pagination: res.pagination! } as AdminListResult<AuditLogEntry>;
  },

  getById: (id: string) => apiRequest<AuditLogEntry>({ method: 'GET', url: `/admin/audit-logs/${id}` }),
};

export const adminSettingsApi = {
  list: (group?: string) => apiRequest<SystemSetting[]>({ method: 'GET', url: '/admin/settings', params: { group } }),

  getByKey: (key: string) => apiRequest<SystemSetting>({ method: 'GET', url: `/admin/settings/${key}` }),

  upsert: (key: string, payload: UpsertSettingPayload) =>
    apiRequest<SystemSetting>({ method: 'PUT', url: `/admin/settings/${key}`, data: payload }),

  bulkUpsert: (settings: Array<UpsertSettingPayload & { key: string }>) =>
    apiRequest<SystemSetting[]>({ method: 'PUT', url: '/admin/settings', data: { settings } }),

  remove: (key: string) => apiRequest<null>({ method: 'DELETE', url: `/admin/settings/${key}` }),
};

export const adminSessionsApi = {
  list: async (params: ListSessionsParams) => {
    const res = await apiRequestFull<UserSession[]>({ method: 'GET', url: '/admin/sessions', params });
    return { items: res.data ?? [], pagination: res.pagination! } as AdminListResult<UserSession>;
  },

  revoke: (id: string) => apiRequest<null>({ method: 'DELETE', url: `/admin/sessions/${id}` }),

  revokeAllForUser: (userId: string) =>
    apiRequest<null>({ method: 'DELETE', url: `/admin/sessions/user/${userId}` }),
};
