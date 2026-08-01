import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PaginationControl } from '@/features/admin/components/PaginationControl';
import { useAuditLogs } from '@/features/admin/hooks/useAuditLogs';

const statusVariant = (status?: number) => {
  if (!status) return 'neutral' as const;
  if (status >= 500) return 'danger' as const;
  if (status >= 400) return 'warning' as const;
  return 'success' as const;
};

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');

  const { data, isLoading, isFetching } = useAuditLogs({
    page,
    limit: 20,
    search: search || undefined,
    module: module || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search by action, module, path…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Input
          placeholder="Filter by module (e.g. ADMIN)"
          className="w-full sm:max-w-xs"
          value={module}
          onChange={(e) => {
            setModule(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-10">
            <LoadingSpinner label="Loading audit logs…" />
          </div>
        ) : !data?.items.length ? (
          <p className="p-10 text-center text-sm text-ink-500">No audit log entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Module</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Method / Path</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-border ${isFetching ? 'opacity-60' : ''}`}>
                {data.items.map((log) => (
                  <tr key={log._id}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-ink-700">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="brand">{log.module}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-900">{log.action}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">
                      {log.method} {log.path}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(log.statusCode)}>{log.statusCode ?? '—'}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">{log.ipAddress ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <PaginationControl pagination={data?.pagination} onPageChange={setPage} />
      </Card>
    </div>
  );
}
