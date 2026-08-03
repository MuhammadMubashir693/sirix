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
import { partySchemaFor, type PartyFormValues } from '../schemas';
import { useCreateParty, useUpdateParty } from '../hooks/useParties';
import type { Party, PartyType } from '@/types/parties';

const STATUSES = ['active', 'inactive', 'suspended'] as const;

const LABELS: Record<PartyType, string> = { customers: 'customer', carriers: 'carrier', vendors: 'vendor' };

const EMPTY: PartyFormValues = {
  name: '',
  email: '',
  code: '',
  phone: '',
  company: '',
  status: 'active',
  notes: '',
};

interface PartyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: PartyType;
  party?: Party | null;
}

export function PartyFormDialog({ open, onOpenChange, type, party }: PartyFormDialogProps) {
  const isEditing = !!party;
  const isCustomer = type === 'customers';
  const label = LABELS[type];

  const createMutation = useCreateParty(type);
  const updateMutation = useUpdateParty(type);
  const pending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partySchemaFor(type)),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      party
        ? {
            name: party.name,
            email: party.email ?? '',
            code: party.code ?? '',
            phone: party.phone ?? '',
            company: party.company ?? '',
            status: party.status,
            notes: party.notes ?? '',
          }
        : EMPTY
    );
  }, [open, party, form]);

  const onSubmit = (values: PartyFormValues) => {
    const payload = {
      name: values.name,
      status: values.status,
      phone: values.phone || undefined,
      notes: values.notes || undefined,
      ...(isCustomer ? { email: values.email, company: values.company || undefined } : { code: values.code }),
    };

    const onSuccess = () => onOpenChange(false);
    if (party) updateMutation.mutate({ id: party._id, payload }, { onSuccess });
    else createMutation.mutate(payload, { onSuccess });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${label}` : `New ${label}`}
          </DialogTitle>
          <DialogDescription>
            {isCustomer
              ? 'Customers are who you invoice.'
              : `${label === 'carrier' ? 'Carriers' : 'Vendors'} are who you pay.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="Name" htmlFor="name" error={form.formState.errors.name?.message} required>
            <Input id="name" invalid={!!form.formState.errors.name} {...form.register('name')} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            {isCustomer ? (
              <FormField label="Email" htmlFor="email" error={form.formState.errors.email?.message} required>
                <Input id="email" type="email" invalid={!!form.formState.errors.email} {...form.register('email')} />
              </FormField>
            ) : (
              <FormField
                label="Code"
                htmlFor="code"
                hint="Short identifier, e.g. ATLS"
                error={form.formState.errors.code?.message}
                required
              >
                <Input id="code" invalid={!!form.formState.errors.code} {...form.register('code')} />
              </FormField>
            )}

            <FormField label="Phone" htmlFor="phone" hint="Optional">
              <Input id="phone" {...form.register('phone')} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isCustomer && (
              <FormField label="Company" htmlFor="company" hint="Optional">
                <Input id="company" {...form.register('company')} />
              </FormField>
            )}

            <FormField label="Status" htmlFor="status" error={form.formState.errors.status?.message} required>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormField label="Notes" htmlFor="notes" hint="Optional">
            <Textarea id="notes" rows={2} {...form.register('notes')} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {isEditing ? 'Save changes' : `Create ${label}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
