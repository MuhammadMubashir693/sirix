import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminSessionsApi } from '@/api/admin';
import type { ListSessionsParams, ApiClientError } from '@/types';

const SESSIONS_KEY = ['admin', 'sessions'];

export function useSessions(params: ListSessionsParams) {
  return useQuery({
    queryKey: [...SESSIONS_KEY, params],
    queryFn: () => adminSessionsApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminSessionsApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success('Session revoked successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useRevokeAllSessionsForUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminSessionsApi.revokeAllForUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success('All sessions revoked for user');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}
