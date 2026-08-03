import { useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
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
import { invoiceSchema, type InvoiceFormValues } from '../schemas';
import { useCreateInvoice, useUpdateInvoice } from '../hooks/useAccounting';
import { useParties } from '../hooks/useParties';
import { formatCurrency, toDateInputValue, todayInputValue } from '../utils';
import type { Invoice, InvoiceStatus } from '@/types/accounting';

const STATUSES: InvoiceStatus[] = ['draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled'];

const NONE = 'none';

const EMPTY_LINE_ITEM = { description: '', quantity: '1', unitPrice: '0' };

function emptyValues(): InvoiceFormValues {
  return {
    invoiceNumber: '',
    customer: '',
    carrier: undefined,
    issueDate: todayInputValue(),
    dueDate: todayInputValue(),
    lineItems: [{ ...EMPTY_LINE_ITEM }],
    tax: '0',
    discount: '0',
    currency: 'USD',
    status: 'pending',
    notes: '',
  };
}

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
}

export function InvoiceFormDialog({ open, onOpenChange, invoice }: InvoiceFormDialogProps) {
  const isEditing = !!invoice;
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const pending = createMutation.isPending || updateMutation.isPending;

  const customersQuery = useParties('customers', { limit: 100, status: 'active' });
  const carriersQuery = useParties('carriers', { limit: 100, status: 'active' });

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: emptyValues(),
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lineItems' });

  useEffect(() => {
    if (!open) return;
    form.reset(
      invoice
        ? {
            invoiceNumber: invoice.invoiceNumber,
            customer: invoice.customer?._id ?? '',
            carrier: invoice.carrier?._id ?? undefined,
            issueDate: toDateInputValue(invoice.issueDate),
            dueDate: toDateInputValue(invoice.dueDate),
            lineItems: invoice.lineItems.map(({ description, quantity, unitPrice }) => ({
              description,
              quantity: String(quantity),
              unitPrice: String(unitPrice),
            })),
            tax: String(invoice.tax),
            discount: String(invoice.discount),
            currency: invoice.currency,
            status: invoice.status,
            notes: invoice.notes ?? '',
          }
        : emptyValues()
    );
  }, [open, invoice, form]);

  const [lineItems, currency, tax, discount] = useWatch({
    control: form.control,
    name: ['lineItems', 'currency', 'tax', 'discount'],
  });
  const subtotal = (lineItems ?? []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const total = Math.max(subtotal + (Number(tax) || 0) - (Number(discount) || 0), 0);

  const onSubmit = (values: InvoiceFormValues) => {
    const payload = {
      customer: values.customer,
      carrier: values.carrier || undefined,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      lineItems: values.lineItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      tax: Number(values.tax),
      discount: Number(values.discount),
      currency: values.currency,
      status: values.status,
      notes: values.notes || undefined,
    };

    const onSuccess = () => onOpenChange(false);
    if (invoice) updateMutation.mutate({ id: invoice._id, payload }, { onSuccess });
    // The server generates the invoice number when it isn't supplied.
    else createMutation.mutate({ ...payload, invoiceNumber: values.invoiceNumber || undefined }, { onSuccess });
  };

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${invoice.invoiceNumber}` : 'New invoice'}</DialogTitle>
          <DialogDescription>
            Totals are calculated from the line items; amount paid comes from recorded payments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Customer" htmlFor="customer" error={errors.customer?.message} required>
              <Controller
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {(customersQuery.data?.items ?? []).map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Carrier" htmlFor="carrier" hint="Optional — the carrier this traffic ran over">
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
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Issue date" htmlFor="issueDate" error={errors.issueDate?.message} required>
              <Input id="issueDate" type="date" invalid={!!errors.issueDate} {...form.register('issueDate')} />
            </FormField>

            <FormField label="Due date" htmlFor="dueDate" error={errors.dueDate?.message} required>
              <Input id="dueDate" type="date" invalid={!!errors.dueDate} {...form.register('dueDate')} />
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
                          {status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <div className="space-y-3 rounded-[var(--radius-control)] border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-900">Line items</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ ...EMPTY_LINE_ITEM })}
              >
                <Plus className="size-4" />
                Add line
              </Button>
            </div>

            {errors.lineItems?.message && (
              <p role="alert" className="text-xs font-medium text-danger-500">
                {errors.lineItems.message}
              </p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_5rem_7rem_auto] items-start gap-2">
                <FormField
                  label={index === 0 ? 'Description' : ''}
                  htmlFor={`lineItems.${index}.description`}
                  error={errors.lineItems?.[index]?.description?.message}
                >
                  <Input
                    id={`lineItems.${index}.description`}
                    placeholder="Termination minutes — EU"
                    invalid={!!errors.lineItems?.[index]?.description}
                    {...form.register(`lineItems.${index}.description`)}
                  />
                </FormField>

                <FormField
                  label={index === 0 ? 'Qty' : ''}
                  htmlFor={`lineItems.${index}.quantity`}
                  error={errors.lineItems?.[index]?.quantity?.message}
                >
                  <Input
                    id={`lineItems.${index}.quantity`}
                    type="number"
                    step="any"
                    min="0"
                    invalid={!!errors.lineItems?.[index]?.quantity}
                    {...form.register(`lineItems.${index}.quantity`)}
                  />
                </FormField>

                <FormField
                  label={index === 0 ? 'Unit price' : ''}
                  htmlFor={`lineItems.${index}.unitPrice`}
                  error={errors.lineItems?.[index]?.unitPrice?.message}
                >
                  <Input
                    id={`lineItems.${index}.unitPrice`}
                    type="number"
                    step="any"
                    min="0"
                    invalid={!!errors.lineItems?.[index]?.unitPrice}
                    {...form.register(`lineItems.${index}.unitPrice`)}
                  />
                </FormField>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove line ${index + 1}`}
                  className={index === 0 ? 'mt-7' : 'mt-1'}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Tax" htmlFor="tax" error={errors.tax?.message}>
              <Input id="tax" type="number" step="any" min="0" invalid={!!errors.tax} {...form.register('tax')} />
            </FormField>

            <FormField label="Discount" htmlFor="discount" error={errors.discount?.message}>
              <Input
                id="discount"
                type="number"
                step="any"
                min="0"
                invalid={!!errors.discount}
                {...form.register('discount')}
              />
            </FormField>

            <FormField label="Currency" htmlFor="currency" error={errors.currency?.message} required>
              <Input id="currency" maxLength={3} invalid={!!errors.currency} {...form.register('currency')} />
            </FormField>
          </div>

          {!isEditing && (
            <FormField label="Invoice number" htmlFor="invoiceNumber" hint="Optional — generated when left blank">
              <Input id="invoiceNumber" placeholder="INV-1009" {...form.register('invoiceNumber')} />
            </FormField>
          )}

          <FormField label="Notes" htmlFor="notes" hint="Optional">
            <Textarea id="notes" rows={2} {...form.register('notes')} />
          </FormField>

          <div className="flex items-center justify-between rounded-[var(--radius-control)] bg-surface-muted px-4 py-3 text-sm">
            <span className="text-ink-500">
              Subtotal {formatCurrency(subtotal, currency)}
            </span>
            <span className="font-display text-base font-semibold text-ink-900">
              Total {formatCurrency(total, currency)}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {isEditing ? 'Save changes' : 'Create invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
