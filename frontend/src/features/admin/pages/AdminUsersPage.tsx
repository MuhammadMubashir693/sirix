import { useState } from 'react';
import { Plus, Search, Pencil, Power, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PaginationControl } from '@/features/admin/components/PaginationControl';
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog';
import { UserFormDialog } from '@/features/admin/components/UserFormDialog';
import { useAdminUsers, useSetAdminUserStatus, useDeleteAdminUser } from '@/features/admin/hooks/useAdminUsers';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { data, isLoading, isFetching } = useAdminUsers({ page, limit: 20, search: search || undefined });
  const setStatusMutation = useSetAdminUserStatus();
  const deleteMutation = useDeleteAdminUser();

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search users…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New user
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-10">
            <LoadingSpinner label="Loading users…" />
          </div>
        ) : !data?.items.length ? (
          <p className="p-10 text-center text-sm text-ink-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last login</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((user) => (
                  <tr key={user._id} className={isFetching ? 'opacity-60' : ''}>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="brand">{user.role?.name}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? 'success' : 'neutral'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(user)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                          disabled={user._id === currentUser?._id}
                          onClick={() =>
                            setStatusMutation.mutate({ id: user._id, isActive: !user.isActive })
                          }
                        >
                          <Power className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          disabled={user._id === currentUser?._id}
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="size-4 text-danger-500" />
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

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editingUser} />

      <ConfirmDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        title="Delete this user?"
        description={`This will permanently remove ${deletingUser?.firstName} ${deletingUser?.lastName}'s access. This action can't be undone from here.`}
        confirmLabel="Delete user"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deletingUser &&
          deleteMutation.mutate(deletingUser._id, { onSuccess: () => setDeletingUser(null) })
        }
      />
    </div>
  );
}
