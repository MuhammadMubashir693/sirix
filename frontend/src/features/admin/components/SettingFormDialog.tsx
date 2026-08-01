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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { settingSchema, type SettingFormValues } from '@/features/admin/schemas';
import { useUpsertSetting } from '@/features/admin/hooks/useSettings';
import type { SystemSetting } from '@/types';

const TYPES = ['string', 'number', 'boolean', 'json'] as const;

interface SettingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting?: SystemSetting | null;
}

function stringifyValue(value: unknown): string {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

export function SettingFormDialog({ open, onOpenChange, setting }: SettingFormDialogProps) {
  const isEditing = !!setting;
  const upsertMutation = useUpsertSetting();

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: { key: '', value: '', type: 'string', group: 'general', description: '', isPublic: false },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        setting
          ? {
              key: setting.key,
              value: stringifyValue(setting.value),
              type: setting.type,
              group: setting.group,
              description: setting.description ?? '',
              isPublic: setting.isPublic,
            }
          : { key: '', value: '', type: 'string', group: 'general', description: '', isPublic: false }
      );
    }
  }, [open, setting, form]);

  const onSubmit = (values: SettingFormValues) => {
    let parsedValue: unknown = values.value;
    if (values.type === 'number') parsedValue = Number(values.value);
    if (values.type === 'boolean') parsedValue = values.value === 'true';
    if (values.type === 'json') {
      try {
        parsedValue = JSON.parse(values.value);
      } catch {
        form.setError('value', { message: 'Must be valid JSON' });
        return;
      }
    }

    upsertMutation.mutate(
      {
        key: values.key,
        payload: {
          value: parsedValue,
          type: values.type,
          group: values.group,
          description: values.description,
          isPublic: values.isPublic,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit setting' : 'New setting'}</DialogTitle>
          <DialogDescription>System settings are stored as typed key/value pairs.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField
            label="Key"
            htmlFor="key"
            hint="e.g. general.company_name"
            error={form.formState.errors.key?.message}
            required
          >
            <Input id="key" disabled={isEditing} invalid={!!form.formState.errors.key} {...form.register('key')} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" htmlFor="type" error={form.formState.errors.type?.message} required>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Group" htmlFor="group" error={form.formState.errors.group?.message} required>
              <Input id="group" invalid={!!form.formState.errors.group} {...form.register('group')} />
            </FormField>
          </div>

          <FormField
            label="Value"
            htmlFor="value"
            error={form.formState.errors.value?.message}
            hint={form.watch('type') === 'json' ? 'Must be valid JSON' : undefined}
            required
          >
            <Textarea id="value" rows={3} invalid={!!form.formState.errors.value} {...form.register('value')} />
          </FormField>

          <FormField label="Description" htmlFor="description" hint="Optional">
            <Input id="description" {...form.register('description')} />
          </FormField>

          <div className="flex items-center justify-between rounded-[var(--radius-control)] border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="isPublic">Public</Label>
              <p className="text-xs text-ink-500">Readable by any authenticated user, not just admins.</p>
            </div>
            <Controller
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <Switch id="isPublic" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={upsertMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={upsertMutation.isPending}>
              {isEditing ? 'Save changes' : 'Create setting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
