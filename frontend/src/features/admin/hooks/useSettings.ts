import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminSettingsApi } from '@/api/admin';
import type { UpsertSettingPayload, ApiClientError } from '@/types';

const SETTINGS_KEY = ['admin', 'settings'];

export function useSettings(group?: string) {
  return useQuery({
    queryKey: [...SETTINGS_KEY, group ?? 'all'],
    queryFn: () => adminSettingsApi.list(group),
  });
}

export function useUpsertSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: UpsertSettingPayload }) =>
      adminSettingsApi.upsert(key, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      toast.success('Setting saved successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}

export function useDeleteSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => adminSettingsApi.remove(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      toast.success('Setting deleted successfully');
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message || 'An error occurred');
    },
  });
}
