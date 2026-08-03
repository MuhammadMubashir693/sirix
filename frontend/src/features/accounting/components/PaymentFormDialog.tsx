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
import { paymentSchema, type PaymentFormValues } from '../schemas';
import { useCreatePayment, useUpdatePayment, useInvoices } from '../hooks/useAccounting';
import { formatCurrency, toDateInputValue, todayInputValue } from '../utils';
import type { Payment, PaymentMethod, PaymentStatus } from '@/types/accounting';

const METHODS: PaymentMethod[] = ['bank_transfer', 'card', 'wire', 'cheque', 'cash', 'other'];
const STATUSES: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded'];

function emptyValues(): PaymentFormValues {
  return {
    paymentNumber: '',
    invoice: '',
    amount: '',
    currency: 'USD',
    method: 'bank_transfer',
    reference: '',
    paidAt: todayInputValue(),
    status: 'completed',
    notes: '',
  };
}

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
}

export function PaymentFormDialog({ open, onOpenChange, payment }: PaymentFormDialogProps) {
  const isEditing = !!payment;
  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();
  const pending = createMutation.isPending || updateMutation.isPending;

  const invoicesQuery = useInvoices({ page: 1, limit: 100 });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      payment
        ? {
            paymentNumber: payment.paymentNumber,
            invoice: payment.invoice?._id ?? '',
            amount: String(payment.amount),
            currency: payment.currency,
            method: payment.method,
            reference: payment.reference ?? '',
            paidAt: toDateInputValue(payment.paidAt),
            status: payment.status,
            notes: payment.notes ?? '',
          }
        : emptyValues()
    );
  }, [open, payment, form]);

  const onSubmit = (values: PaymentFormValues) => {
    const shared = {
      amount: Number(values.amount),
      currency: values.currency,
      method: values.method,
      reference: values.reference || undefined,
      paidAt: values.paidAt,
      status: values.status,
      notes: values.notes || undefined,
    };

    const onSuccess = () => onOpenChange(false);
    if (payment) {
      // The API doesn't allow repointing a payment at a different invoice.
      updateMutation.mutate({ id: payment._id, payload: shared }, { onSuccess });
    } else {
      createMutation.mutate(
        { ...shared, invoice: values.invoice, paymentNumber: values.paymentNumber || undefined },
        { onSuccess }
      );
    }
  };

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${payment.paymentNumber}` : 'Record a payment'}</DialogTitle>
          <DialogDescription>
            Completed payments increase the invoice's amount paid and count towards revenue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField
            label="Invoice"
            htmlFor="invoice"
            error={errors.invoice?.message}
            hint={isEditing ? "An existing payment can't be moved to another invoice" : undefined}
            required
          >
            <Controller
              control={form.control}
              name="invoice"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                  <SelectTrigger id="invoice">
                    <SelectValue placeholder="Select an invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {(invoicesQuery.data?.items ?? []).map((invoice) => (
                      <SelectItem key={invoice._id} value={invoice._id}>
                        {invoice.invoiceNumber} — {invoice.customer?.name ?? 'Unknown customer'} (
                        {formatCurrency(invoice.outstandingBalance, invoice.currency)} due)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

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
            <FormField label="Reference" htmlFor="reference" hint="Optional — bank or remittance reference">
              <Input id="reference" {...form.register('reference')} />
            </FormField>

            {!isEditing && (
              <FormField label="Payment number" htmlFor="paymentNumber" hint="Optional — generated when left blank">
                <Input id="paymentNumber" placeholder="PAY-2006" {...form.register('paymentNumber')} />
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
              {isEditing ? 'Save changes' : 'Record payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
