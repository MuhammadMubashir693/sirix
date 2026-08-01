import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { roleSchema, type RoleFormValues } from '@/features/admin/schemas';
import { useCreateRole, useUpdateRole } from '@/features/admin/hooks/useRoles';
import { usePermissions } from '@/features/admin/hooks/usePermissions';
import type { Role } from '@/types';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
}

export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEditing = !!role;
  const { data: permissions } = usePermissions();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '', description: '', permissions: [] },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: role?.name ?? '',
        description: role?.description ?? '',
        permissions: role?.permissions.map((p) => p._id) ?? [],
      });
    }
  }, [open, role, form]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof permissions> = {};
    (permissions ?? []).forEach((perm) => {
      groups[perm.module] = groups[perm.module] || [];
      groups[perm.module]!.push(perm);
    });
    return groups;
  }, [permissions]);

  const onSubmit = (values: RoleFormValues) => {
    if (isEditing && role) {
      updateMutation.mutate({ id: role._id, payload: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isBuiltIn = !!role?.isSystem;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit role' : 'Create role'}</DialogTitle>
          <DialogDescription>
            {isBuiltIn
              ? 'This is a built-in role — its name is fixed, but you can still adjust its permissions.'
              : 'Define a role and choose which permissions it grants.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="Role name" htmlFor="name" error={form.formState.errors.name?.message} required>
            <Input id="name" disabled={isBuiltIn} invalid={!!form.formState.errors.name} {...form.register('name')} />
          </FormField>

          <FormField label="Description" htmlFor="description" hint="Optional">
            <Textarea id="description" rows={2} {...form.register('description')} />
          </FormField>

          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Permissions</p>
            <Controller
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <div className="max-h-64 space-y-4 overflow-y-auto rounded-[var(--radius-control)] border border-border p-3">
                  {Object.entries(grouped).map(([module, perms]) => (
                    <div key={module}>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">{module}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {perms?.map((perm) => (
                          <label key={perm._id} className="flex items-center gap-1.5 text-sm text-ink-700">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-border-strong text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500"
                              checked={field.value.includes(perm._id)}
                              onChange={(e) => {
                                field.onChange(
                                  e.target.checked
                                    ? [...field.value, perm._id]
                                    : field.value.filter((id) => id !== perm._id)
                                );
                              }}
                            />
                            {perm.action}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEditing ? 'Save changes' : 'Create role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
