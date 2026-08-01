import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog';
import { SettingFormDialog } from '@/features/admin/components/SettingFormDialog';
import { useSettings, useDeleteSetting } from '@/features/admin/hooks/useSettings';
import type { SystemSetting } from '@/types';

function displayValue(setting: SystemSetting): string {
  if (setting.type === 'boolean') return setting.value ? 'true' : 'false';
  if (setting.type === 'json') return JSON.stringify(setting.value);
  return String(setting.value);
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const deleteMutation = useDeleteSetting();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [deletingSetting, setDeletingSetting] = useState<SystemSetting | null>(null);

  const grouped = useMemo(() => {
    const groups: Record<string, SystemSetting[]> = {};
    (settings ?? []).forEach((setting) => {
      groups[setting.group] = groups[setting.group] || [];
      groups[setting.group].push(setting);
    });
    return groups;
  }, [settings]);

  const openCreate = () => {
    setEditingSetting(null);
    setFormOpen(true);
  };

  const openEdit = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New setting
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-10">
          <LoadingSpinner label="Loading settings…" />
        </Card>
      ) : !settings?.length ? (
        <Card className="p-10 text-center text-sm text-ink-500">No settings configured yet.</Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([group, groupSettings]) => (
            <Card key={group} className="overflow-hidden">
              <div className="border-b border-border bg-surface-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {group}
              </div>
              <div className="divide-y divide-border">
                {groupSettings.map((setting) => (
                  <div key={setting._id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-ink-900">{setting.key}</span>
                        <Badge variant="neutral">{setting.type}</Badge>
                        {setting.isPublic && <Badge variant="brand">Public</Badge>}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-ink-500">{displayValue(setting)}</p>
                      {setting.description && <p className="mt-0.5 text-xs text-ink-500">{setting.description}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(setting)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeletingSetting(setting)}>
                        <Trash2 className="size-4 text-danger-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <SettingFormDialog open={formOpen} onOpenChange={setFormOpen} setting={editingSetting} />

      <ConfirmDialog
        open={!!deletingSetting}
        onOpenChange={(open) => !open && setDeletingSetting(null)}
        title="Delete this setting?"
        description={`"${deletingSetting?.key}" will be permanently removed.`}
        confirmLabel="Delete setting"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deletingSetting &&
          deleteMutation.mutate(deletingSetting.key, { onSuccess: () => setDeletingSetting(null) })
        }
      />
    </div>
  );
}
