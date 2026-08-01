import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog';
import { PermissionFormDialog } from '@/features/admin/components/PermissionFormDialog';
import { usePermissions, useDeletePermission } from '@/features/admin/hooks/usePermissions';
import type { Permission } from '@/types';

export default function AdminPermissionsPage() {
  const { data: permissions, isLoading } = usePermissions();
  const deleteMutation = useDeletePermission();
  const [formOpen, setFormOpen] = useState(false);
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null);

  const grouped = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    (permissions ?? []).forEach((perm) => {
      groups[perm.module] = groups[perm.module] || [];
      groups[perm.module].push(perm);
    });
    return groups;
  }, [permissions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          New permission
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-10">
          <LoadingSpinner label="Loading permissions…" />
        </Card>
      ) : !permissions?.length ? (
        <Card className="p-10 text-center text-sm text-ink-500">No permissions found.</Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([module, perms]) => (
            <Card key={module} className="overflow-hidden">
              <div className="border-b border-border bg-surface-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {module}
              </div>
              <div className="divide-y divide-border">
                {perms.map((perm) => (
                  <div key={perm._id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Badge variant="brand">{perm.key}</Badge>
                      {perm.description && <span className="text-sm text-ink-500">{perm.description}</span>}
                    </div>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeletingPermission(perm)}>
                      <Trash2 className="size-4 text-danger-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <PermissionFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={!!deletingPermission}
        onOpenChange={(open) => !open && setDeletingPermission(null)}
        title="Delete this permission?"
        description={`"${deletingPermission?.key}" must not be assigned to any role before it can be deleted.`}
        confirmLabel="Delete permission"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deletingPermission &&
          deleteMutation.mutate(deletingPermission._id, { onSuccess: () => setDeletingPermission(null) })
        }
      />
    </div>
  );
}
