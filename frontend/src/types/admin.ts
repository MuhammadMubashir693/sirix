import type { PaginationMeta, User } from './auth';

// --- Users (admin management) ---

export interface AdminCreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
  phone?: string;
}

export interface AdminUpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AdminListUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  role?: string;
  isActive?: 'true' | 'false';
}

// --- Roles ---

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

// --- Permissions ---

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'export';

export interface CreatePermissionPayload {
  module: string;
  action: PermissionAction;
  description?: string;
}

export interface UpdatePermissionPayload {
  description?: string;
}

// --- Audit logs ---

export interface AuditLogEntry {
  _id: string;
  user?: Pick<User, '_id' | 'firstName' | 'lastName' | 'email'> | null;
  action: string;
  module: string;
  method?: string;
  path?: string;
  statusCode?: number;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  module?: string;
  action?: string;
  user?: string;
  from?: string;
  to?: string;
}

// --- Settings ---

export type SettingType = 'string' | 'number' | 'boolean' | 'json';

export interface SystemSetting {
  _id: string;
  key: string;
  value: unknown;
  type: SettingType;
  group: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSettingPayload {
  value: unknown;
  type: SettingType;
  group: string;
  description?: string;
  isPublic?: boolean;
}

// --- Sessions ---

export interface UserSession {
  _id: string;
  user: Pick<User, '_id' | 'firstName' | 'lastName' | 'email'>;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  createdAt: string;
}

export interface ListSessionsParams {
  page?: number;
  limit?: number;
  userId?: string;
}

// --- Shared list response shape ---

export interface AdminListResult<T> {
  items: T[];
  pagination: PaginationMeta;
}
