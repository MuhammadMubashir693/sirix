import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { tokenService } from '@/services/tokenService';
import type {
  LoginPayload,
  RegisterPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ApiClientError,
} from '@/types';

const AUTH_ME_KEY = ['auth', 'me'];

export function useCurrentUser(enabled: boolean) {
  return useQuery({
    queryKey: AUTH_ME_KEY,
    queryFn: authApi.me,
    enabled,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: LoginPayload; rememberMe: boolean }) => authApi.login(payload),
    onSuccess: (data, variables) => {
      setSession(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken }, variables.rememberMe);
      queryClient.setQueryData(AUTH_ME_KEY, data.user);
      toast.success(`Welcome back, ${data.user.firstName}`);
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'Invalid email or password');
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: () => {
      toast.success('Account created. You can now sign in.');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(tokenService.getRefreshToken()),
    onSettled: () => {
      // Clear locally regardless of whether the server call succeeded — the user
      // should never feel "stuck" logged in because of a network blip.
      clearSession();
      queryClient.clear();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'Could not change password');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
    onSuccess: () => {
      toast.success('If that email is registered, a reset link has been sent');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    onSuccess: () => {
      toast.success('Password reset. You can now sign in.');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'Reset link is invalid or expired');
    },
  });
}
