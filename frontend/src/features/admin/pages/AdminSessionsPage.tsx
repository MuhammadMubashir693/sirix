import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PaginationControl } from '@/features/admin/components/PaginationControl';
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog';
import { useSessions, useRevokeSession } from '@/features/admin/hooks/useSessions';
import type { UserSession } from '@/types';

export default function AdminSessionsPage() {
  const [page, setPage] = useState(1);
  const [revokingSession, setRevokingSession] = useState<UserSession | null>(null);

  const { data, isLoading, isFetching } = useSessions({ page, limit: 20 });
  const revokeMutation = useRevokeSession();

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-10">
            <LoadingSpinner label="Loading sessions…" />
          </div>
        ) : !data?.items.length ? (
          <p className="p-10 text-center text-sm text-ink-500">No active sessions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Device / Agent</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-border ${isFetching ? 'opacity-60' : ''}`}>
                {data.items.map((session) => (
                  <tr key={session._id}>
                    <td className="px-4 py-3 text-ink-900">
                      {session.user.firstName} {session.user.lastName}
                      <div className="text-xs text-ink-500">{session.user.email}</div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-ink-500" title={session.userAgent}>
                      {session.userAgent || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">{session.ipAddress ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">
                      {new Date(session.expiresAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" title="Revoke session" onClick={() => setRevokingSession(session)}>
                          <LogOut className="size-4 text-danger-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <PaginationControl pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={!!revokingSession}
        onOpenChange={(open) => !open && setRevokingSession(null)}
        title="Revoke this session?"
        description={`${revokingSession?.user.firstName} ${revokingSession?.user.lastName} will be signed out of this device immediately.`}
        confirmLabel="Revoke session"
        loading={revokeMutation.isPending}
        onConfirm={() =>
          revokingSession &&
          revokeMutation.mutate(revokingSession._id, { onSuccess: () => setRevokingSession(null) })
        }
      />
    </div>
  );
}
