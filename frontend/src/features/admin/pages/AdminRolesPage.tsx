import { useState } from 'react';
import { Plus, Pencil, Trash2, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog';
import { RoleFormDialog } from '@/features/admin/components/RoleFormDialog';
import { useRoles, useDeleteRole } from '@/features/admin/hooks/useRoles';
import type { Role } from '@/types';

export default function AdminRolesPage() {
  const { data: roles, isLoading } = useRoles();
  const deleteMutation = useDeleteRole();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const openCreate = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New role
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-10">
            <LoadingSpinner label="Loading roles…" />
          </div>
        ) : !roles?.length ? (
          <p className="p-10 text-center text-sm text-ink-500">No roles found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Permissions</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roles.map((role) => (
                  <tr key={role._id}>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      <div className="flex items-center gap-1.5">
                        {role.name}
                        {role.isSystem && (
                          <span title="Built-in role">
                            <Lock className="size-3.5 text-ink-400" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{role.description || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="brand">{role.permissions.length} permissions</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(role)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={role.isSystem ? 'Built-in roles cannot be deleted' : 'Delete'}
                          disabled={role.isSystem}
                          onClick={() => setDeletingRole(role)}
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
      </Card>

      <RoleFormDialog open={formOpen} onOpenChange={setFormOpen} role={editingRole} />

      <ConfirmDialog
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        title="Delete this role?"
        description={`Users assigned to "${deletingRole?.name}" must be reassigned before this role can be removed.`}
        confirmLabel="Delete role"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deletingRole &&
          deleteMutation.mutate(deletingRole._id, { onSuccess: () => setDeletingRole(null) })
        }
      />
    </div>
  );
}
