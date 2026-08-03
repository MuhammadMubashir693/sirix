import { z } from 'zod';
import type { PartyType } from '@/types/parties';

/**
 * Number inputs hand us strings, and keeping them strings all the way through
 * validation keeps the form's value type identical to its resolver's output type.
 * Callers convert with Number() when building the payload.
 */
const amount = (predicate: (value: number) => boolean, message: string) =>
  z
    .string()
    .trim()
    .min(1, 'Required')
    .refine((value) => Number.isFinite(Number(value)) && predicate(Number(value)), message);

const money = amount((value) => value >= 0, 'Enter an amount of 0 or more');
const positiveMoney = amount((value) => value > 0, 'Enter an amount greater than 0');

const optionalId = z.string().optional();

export const invoiceSchema = z.object({
  invoiceNumber: z.string().trim().optional(),
  customer: z.string().min(1, 'Customer is required'),
  carrier: optionalId,
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  lineItems: z
    .array(
      z.object({
        description: z.string().trim().min(1, 'Description is required'),
        quantity: positiveMoney,
        unitPrice: money,
      })
    )
    .min(1, 'Add at least one line item'),
  tax: money,
  discount: money,
  currency: z.string().trim().min(3).max(3),
  status: z.enum(['draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled']),
  notes: z.string().optional(),
});
export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const paymentSchema = z.object({
  paymentNumber: z.string().trim().optional(),
  invoice: z.string().min(1, 'Invoice is required'),
  amount: positiveMoney,
  currency: z.string().trim().min(3).max(3),
  method: z.enum(['bank_transfer', 'card', 'wire', 'cheque', 'cash', 'other']),
  reference: z.string().trim().optional(),
  paidAt: z.string().min(1, 'Payment date is required'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  notes: z.string().optional(),
});
export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const carrierPaymentSchema = z
  .object({
    paymentNumber: z.string().trim().optional(),
    carrier: optionalId,
    vendor: optionalId,
    amount: positiveMoney,
    currency: z.string().trim().min(3).max(3),
    method: z.enum(['bank_transfer', 'wire', 'cheque', 'cash', 'other']),
    reference: z.string().trim().optional(),
    paidAt: z.string().min(1, 'Payment date is required'),
    status: z.enum(['pending', 'completed', 'failed', 'cancelled']),
    notes: z.string().optional(),
  })
  .refine((values) => !!values.carrier || !!values.vendor, {
    message: 'Pick a carrier, a vendor, or both',
    path: ['carrier'],
  });
export type CarrierPaymentFormValues = z.infer<typeof carrierPaymentSchema>;

export const partySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  code: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9]{2,10}$/, '2-10 letters or numbers')
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  notes: z.string().optional(),
});
export type PartyFormValues = z.infer<typeof partySchema>;

/** Customers are keyed by email, carriers and vendors by code. */
export function partySchemaFor(type: PartyType) {
  return type === 'customers'
    ? partySchema.refine((values) => !!values.email, { message: 'Email is required', path: ['email'] })
    : partySchema.refine((values) => !!values.code, { message: 'Code is required', path: ['code'] });
}
