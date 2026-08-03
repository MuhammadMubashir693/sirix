import { apiRequest } from '@/lib/apiClient';
import type {
  User,
  LoginPayload,
  RegisterPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  LoginResponseData,
  RefreshResponseData,
} from '@/types';

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiRequest<User>({ method: 'POST', url: '/auth/register', data: payload }),

  login: (payload: LoginPayload) =>
    apiRequest<LoginResponseData>({ method: 'POST', url: '/auth/login', data: payload }),

  refresh: (refreshToken: string) =>
    apiRequest<RefreshResponseData>({ method: 'POST', url: '/auth/refresh', data: { refreshToken } }),

  logout: (refreshToken: string | null) =>
    apiRequest<null>({ method: 'POST', url: '/auth/logout', data: { refreshToken } }),

  changePassword: (payload: ChangePasswordPayload) =>
    apiRequest<null>({ method: 'POST', url: '/auth/change-password', data: payload }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiRequest<{ resetUrl?: string | null }>({ method: 'POST', url: '/auth/forgot-password', data: payload }),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiRequest<null>({ method: 'POST', url: '/auth/reset-password', data: payload }),

  me: () => apiRequest<User>({ method: 'GET', url: '/auth/me' }),
};
