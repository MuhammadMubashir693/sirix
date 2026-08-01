import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminPermissionsApi } from '@/api/admin';
import type { CreatePermissionPayload, UpdatePermissionPayload, ApiClientError } from '@/types';

const PERMISSIONS_KEY = ['admin', 'permissions'];

export function usePermissions() {
  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn: () => adminPermissionsApi.list(),
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionPayload) => adminPermissionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      toast.success('Permission created successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePermissionPayload }) =>
      adminPermissionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      toast.success('Permission updated successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminPermissionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      toast.success('Permission deleted successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}
