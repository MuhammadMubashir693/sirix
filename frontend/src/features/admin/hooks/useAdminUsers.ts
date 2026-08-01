import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminUsersApi } from '@/api/admin';
import type {
  AdminListUsersParams,
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  ApiClientError,
} from '@/types';

const USERS_KEY = ['admin', 'users'];

export function useAdminUsers(params: AdminListUsersParams) {
  return useQuery({
    queryKey: [...USERS_KEY, params],
    queryFn: () => adminUsersApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: [...USERS_KEY, id],
    queryFn: () => adminUsersApi.getById(id as string),
    enabled: !!id,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCreateUserPayload) => adminUsersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('User created successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdateUserPayload }) =>
      adminUsersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('User updated successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useSetAdminUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminUsersApi.setStatus(id, isActive),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success(`User ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminUsersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('User deleted successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}
