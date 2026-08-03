const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

// --- Invoices ---

const lineItem = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
});

const invoiceIdParam = { params: z.object({ id: objectId }) };

const listInvoicesQuery = {
  query: paginationQuery.extend({
    status: z.enum(['draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled']).optional(),
    customer: objectId.optional(),
    carrier: objectId.optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
};

const createInvoice = {
  body: z.object({
    invoiceNumber: z.string().trim().optional(),
    customer: objectId,
    carrier: objectId.optional(),
    issueDate: z.coerce.date().optional(),
    dueDate: z.coerce.date(),
    lineItems: z.array(lineItem).min(1),
    tax: z.coerce.number().min(0).optional(),
    discount: z.coerce.number().min(0).optional(),
    currency: z.string().trim().optional(),
    status: z.enum(['draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled']).optional(),
    notes: z.string().optional(),
  }),
};

const updateInvoice = {
  params: z.object({ id: objectId }),
  body: z.object({
    customer: objectId.optional(),
    carrier: objectId.optional(),
    issueDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    lineItems: z.array(lineItem).min(1).optional(),
    tax: z.coerce.number().min(0).optional(),
    discount: z.coerce.number().min(0).optional(),
    currency: z.string().trim().optional(),
    status: z.enum(['draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled']).optional(),
    notes: z.string().optional(),
  }),
};

// --- Payments ---

const paymentIdParam = { params: z.object({ id: objectId }) };

const listPaymentsQuery = {
  query: paginationQuery.extend({
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    method: z.enum(['bank_transfer', 'card', 'wire', 'cheque', 'cash', 'other']).optional(),
    invoice: objectId.optional(),
    customer: objectId.optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
};

const createPayment = {
  body: z.object({
    paymentNumber: z.string().trim().optional(),
    invoice: objectId,
    customer: objectId.optional(),
    amount: z.coerce.number().positive(),
    currency: z.string().trim().optional(),
    method: z.enum(['bank_transfer', 'card', 'wire', 'cheque', 'cash', 'other']),
    reference: z.string().optional(),
    paidAt: z.coerce.date().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    notes: z.string().optional(),
  }),
};

const updatePayment = {
  params: z.object({ id: objectId }),
  body: z.object({
    amount: z.coerce.number().positive().optional(),
    method: z.enum(['bank_transfer', 'card', 'wire', 'cheque', 'cash', 'other']).optional(),
    reference: z.string().optional(),
    paidAt: z.coerce.date().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    notes: z.string().optional(),
  }),
};

// --- Carrier payments ---

const carrierPaymentIdParam = { params: z.object({ id: objectId }) };

const listCarrierPaymentsQuery = {
  query: paginationQuery.extend({
    status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
    method: z.enum(['bank_transfer', 'wire', 'cheque', 'cash', 'other']).optional(),
    carrier: objectId.optional(),
    vendor: objectId.optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
};

const createCarrierPayment = {
  body: z
    .object({
      paymentNumber: z.string().trim().optional(),
      carrier: objectId.optional(),
      vendor: objectId.optional(),
      amount: z.coerce.number().positive(),
      currency: z.string().trim().optional(),
      method: z.enum(['bank_transfer', 'wire', 'cheque', 'cash', 'other']),
      reference: z.string().optional(),
      billingPeriodStart: z.coerce.date().optional(),
      billingPeriodEnd: z.coerce.date().optional(),
      paidAt: z.coerce.date().optional(),
      status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
      notes: z.string().optional(),
    })
    .refine((data) => data.carrier || data.vendor, {
      message: 'Either carrier or vendor is required',
      path: ['carrier'],
    }),
};

const updateCarrierPayment = {
  params: z.object({ id: objectId }),
  body: z.object({
    amount: z.coerce.number().positive().optional(),
    method: z.enum(['bank_transfer', 'wire', 'cheque', 'cash', 'other']).optional(),
    reference: z.string().optional(),
    billingPeriodStart: z.coerce.date().optional(),
    billingPeriodEnd: z.coerce.date().optional(),
    paidAt: z.coerce.date().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
    notes: z.string().optional(),
  }),
};

// --- Dashboard ---

const dashboardQuery = {
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
};

module.exports = {
  invoiceIdParam,
  listInvoicesQuery,
  createInvoice,
  updateInvoice,
  paymentIdParam,
  listPaymentsQuery,
  createPayment,
  updatePayment,
  carrierPaymentIdParam,
  listCarrierPaymentsQuery,
  createCarrierPayment,
  updateCarrierPayment,
  dashboardQuery,
};
