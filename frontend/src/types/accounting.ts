import type { PaginationMeta } from './auth';

// --- Invoices ---

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceRef {
  _id: string;
  name?: string;
  email?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: InvoiceRef;
  carrier?: InvoiceRef | null;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  currency: string;
  status: InvoiceStatus;
  notes?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoicePayload {
  invoiceNumber?: string;
  customer: string;
  carrier?: string;
  issueDate?: string;
  dueDate: string;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
  tax?: number;
  discount?: number;
  currency?: string;
  status?: InvoiceStatus;
  notes?: string;
}

export type UpdateInvoicePayload = Partial<CreateInvoicePayload>;

export interface ListInvoicesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: InvoiceStatus;
  customer?: string;
  carrier?: string;
  from?: string;
  to?: string;
}

// --- Payments (customer payments against invoices) ---

export type PaymentMethod = 'bank_transfer' | 'card' | 'wire' | 'cheque' | 'cash' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  _id: string;
  paymentNumber: string;
  invoice: Pick<Invoice, '_id' | 'invoiceNumber' | 'totalAmount' | 'status'>;
  customer: InvoiceRef;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  paidAt: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  paymentNumber?: string;
  invoice: string;
  customer?: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  reference?: string;
  paidAt?: string;
  status?: PaymentStatus;
  notes?: string;
}

export type UpdatePaymentPayload = Partial<Omit<CreatePaymentPayload, 'invoice'>>;

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  invoice?: string;
  customer?: string;
  from?: string;
  to?: string;
}

// --- Carrier payments (outbound payments to vendors/carriers) ---

export type CarrierPaymentMethod = 'bank_transfer' | 'wire' | 'cheque' | 'cash' | 'other';
export type CarrierPaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface CarrierPayment {
  _id: string;
  paymentNumber: string;
  carrier?: InvoiceRef | null;
  vendor?: InvoiceRef | null;
  amount: number;
  currency: string;
  method: CarrierPaymentMethod;
  reference?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  paidAt: string;
  status: CarrierPaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarrierPaymentPayload {
  paymentNumber?: string;
  carrier?: string;
  vendor?: string;
  amount: number;
  currency?: string;
  method: CarrierPaymentMethod;
  reference?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  paidAt?: string;
  status?: CarrierPaymentStatus;
  notes?: string;
}

export type UpdateCarrierPaymentPayload = Partial<CreateCarrierPaymentPayload>;

export interface ListCarrierPaymentsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: CarrierPaymentStatus;
  method?: CarrierPaymentMethod;
  carrier?: string;
  vendor?: string;
  from?: string;
  to?: string;
}

// --- Dashboard ---

export interface AccountingDashboard {
  revenue: number;
  expenses: number;
  profit: number;
  outstandingInvoices: number;
  totalInvoiced: number;
  invoiceCount: number;
  pendingCarrierPayments: { total: number; count: number };
  invoiceStatusBreakdown: Array<{ status: InvoiceStatus; count: number; total: number }>;
}

export interface AccountingDashboardParams {
  from?: string;
  to?: string;
}

// --- Shared list response shape ---

export interface AccountingListResult<T> {
  items: T[];
  pagination: PaginationMeta;
}
