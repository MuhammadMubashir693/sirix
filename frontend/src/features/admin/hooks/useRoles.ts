import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminRolesApi } from '@/api/admin';
import type { CreateRolePayload, UpdateRolePayload, ApiClientError } from '@/types';

const ROLES_KEY = ['admin', 'roles'];

export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => adminRolesApi.list(),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => adminRolesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Role created successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      adminRolesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Role updated successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRolesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Role deleted successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}
