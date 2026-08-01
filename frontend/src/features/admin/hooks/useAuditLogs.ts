import { useQuery } from '@tanstack/react-query';
import { adminAuditLogsApi } from '@/api/admin';
import type { AuditLogListParams } from '@/types';

const AUDIT_LOGS_KEY = ['admin', 'audit-logs'];

export function useAuditLogs(params: AuditLogListParams) {
  return useQuery({
    queryKey: [...AUDIT_LOGS_KEY, params],
    queryFn: () => adminAuditLogsApi.list(params),
    placeholderData: (previous) => previous,
  });
}
