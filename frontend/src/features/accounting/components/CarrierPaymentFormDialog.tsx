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
import { carrierPaymentSchema, type CarrierPaymentFormValues } from '../schemas';
import { useCreateCarrierPayment, useUpdateCarrierPayment } from '../hooks/useAccounting';
import { useParties } from '../hooks/useParties';
import { toDateInputValue, todayInputValue } from '../utils';
import type { CarrierPayment, CarrierPaymentMethod, CarrierPaymentStatus } from '@/types/accounting';

const METHODS: CarrierPaymentMethod[] = ['bank_transfer', 'wire', 'cheque', 'cash', 'other'];
const STATUSES: CarrierPaymentStatus[] = ['pending', 'completed', 'failed', 'cancelled'];

const NONE = 'none';

function emptyValues(): CarrierPaymentFormValues {
  return {
    paymentNumber: '',
    carrier: undefined,
    vendor: undefined,
    amount: '',
    currency: 'USD',
    method: 'bank_transfer',
    reference: '',
    paidAt: todayInputValue(),
    status: 'completed',
    notes: '',
  };
}

interface CarrierPaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrierPayment?: CarrierPayment | null;
}

export function CarrierPaymentFormDialog({ open, onOpenChange, carrierPayment }: CarrierPaymentFormDialogProps) {
  const isEditing = !!carrierPayment;
  const createMutation = useCreateCarrierPayment();
  const updateMutation = useUpdateCarrierPayment();
  const pending = createMutation.isPending || updateMutation.isPending;

  const carriersQuery = useParties('carriers', { limit: 100, status: 'active' });
  const vendorsQuery = useParties('vendors', { limit: 100, status: 'active' });

  const form = useForm<CarrierPaymentFormValues>({
    resolver: zodResolver(carrierPaymentSchema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      carrierPayment
        ? {
            paymentNumber: carrierPayment.paymentNumber,
            carrier: carrierPayment.carrier?._id ?? undefined,
            vendor: carrierPayment.vendor?._id ?? undefined,
            amount: String(carrierPayment.amount),
            currency: carrierPayment.currency,
            method: carrierPayment.method,
            reference: carrierPayment.reference ?? '',
            paidAt: toDateInputValue(carrierPayment.paidAt),
            status: carrierPayment.status,
            notes: carrierPayment.notes ?? '',
          }
        : emptyValues()
    );
  }, [open, carrierPayment, form]);

  const onSubmit = (values: CarrierPaymentFormValues) => {
    const payload = {
      carrier: values.carrier || undefined,
      vendor: values.vendor || undefined,
      amount: Number(values.amount),
      currency: values.currency,
      method: values.method,
      reference: values.reference || undefined,
      paidAt: values.paidAt,
      status: values.status,
      notes: values.notes || undefined,
    };

    const onSuccess = () => onOpenChange(false);
    if (carrierPayment) updateMutation.mutate({ id: carrierPayment._id, payload }, { onSuccess });
    else createMutation.mutate({ ...payload, paymentNumber: values.paymentNumber || undefined }, { onSuccess });
  };

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${carrierPayment.paymentNumber}` : 'New carrier payment'}
          </DialogTitle>
          <DialogDescription>
            Completed carrier payments count as expenses in Accounting and Reports.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Carrier"
              htmlFor="carrier"
              error={errors.carrier?.message}
              hint="The carrier this settles"
            >
              <Controller
                control={form.control}
                name="carrier"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(value) => field.onChange(value === NONE ? undefined : value)}
                  >
                    <SelectTrigger id="carrier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No carrier</SelectItem>
                      {(carriersQuery.data?.items ?? []).map((carrier) => (
                        <SelectItem key={carrier._id} value={carrier._id}>
                          {carrier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Vendor" htmlFor="vendor" hint="Who the money was actually paid to">
              <Controller
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(value) => field.onChange(value === NONE ? undefined : value)}
                  >
                    <SelectTrigger id="vendor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No vendor</SelectItem>
                      {(vendorsQuery.data?.items ?? []).map((vendor) => (
                        <SelectItem key={vendor._id} value={vendor._id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Amount" htmlFor="amount" error={errors.amount?.message} required>
              <Input
                id="amount"
                type="number"
                step="any"
                min="0"
                invalid={!!errors.amount}
                {...form.register('amount')}
              />
            </FormField>

            <FormField label="Currency" htmlFor="currency" error={errors.currency?.message} required>
              <Input id="currency" maxLength={3} invalid={!!errors.currency} {...form.register('currency')} />
            </FormField>

            <FormField label="Paid at" htmlFor="paidAt" error={errors.paidAt?.message} required>
              <Input id="paidAt" type="date" invalid={!!errors.paidAt} {...form.register('paidAt')} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Method" htmlFor="method" error={errors.method?.message} required>
              <Controller
                control={form.control}
                name="method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Reference" htmlFor="reference" hint="Optional — settlement reference">
              <Input id="reference" {...form.register('reference')} />
            </FormField>

            {!isEditing && (
              <FormField label="Payment number" htmlFor="paymentNumber" hint="Optional — generated when left blank">
                <Input id="paymentNumber" placeholder="CPY-3007" {...form.register('paymentNumber')} />
              </FormField>
            )}
          </div>

          <FormField label="Notes" htmlFor="notes" hint="Optional">
            <Textarea id="notes" rows={2} {...form.register('notes')} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {isEditing ? 'Save changes' : 'Create payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
