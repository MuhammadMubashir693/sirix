/** Mirrors the backend's standard response envelope: { success, message, data, pagination, errors } */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  pagination: PaginationMeta | null;
  errors: Record<string, unknown> | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Permission {
  _id: string;
  key: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'export';
  description?: string;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponseData extends AuthTokens {
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}
