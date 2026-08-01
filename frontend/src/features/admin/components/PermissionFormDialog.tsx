import { useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { permissionSchema, type PermissionFormValues } from '@/features/admin/schemas';
import { useCreatePermission } from '@/features/admin/hooks/usePermissions';

const ACTIONS = ['create', 'read', 'update', 'delete', 'manage', 'export'] as const;

interface PermissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PermissionFormDialog({ open, onOpenChange }: PermissionFormDialogProps) {
  const createMutation = useCreatePermission();

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: { module: '', action: 'read', description: '' },
  });

  useEffect(() => {
    if (open) form.reset({ module: '', action: 'read', description: '' });
  }, [open, form]);

  const onSubmit = (values: PermissionFormValues) => {
    createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create permission</DialogTitle>
          <DialogDescription>Permissions are keyed as "module:action" and can be attached to roles.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField
            label="Module"
            htmlFor="module"
            hint="Lowercase, e.g. invoices"
            error={form.formState.errors.module?.message}
            required
          >
            <Input id="module" invalid={!!form.formState.errors.module} {...form.register('module')} />
          </FormField>

          <FormField label="Action" htmlFor="action" error={form.formState.errors.action?.message} required>
            <Controller
              control={form.control}
              name="action"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Description" htmlFor="description" hint="Optional">
            <Input id="description" {...form.register('description')} />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create permission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
