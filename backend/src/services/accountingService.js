const invoiceRepository = require('../repositories/invoiceRepository');
const paymentRepository = require('../repositories/paymentRepository');
const carrierPaymentRepository = require('../repositories/carrierPaymentRepository');
const { parsePaginationQuery, buildPaginationMeta } = require('../utils/pagination');
const ApiError = require('../utils/ApiError');

function generateDocNumber(prefix) {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${stamp}-${rand}`;
}

function computeTotals({ lineItems, tax = 0, discount = 0 }) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalAmount = Math.max(subtotal + Number(tax) - Number(discount), 0);
  return { subtotal, totalAmount };
}

/**
 * Recomputes an invoice's amountPaid from the payments that still reference it,
 * so deleting or editing a payment can't leave the invoice overstated.
 */
async function syncInvoicePaidState(invoiceId, userId) {
  const invoice = await invoiceRepository.findById(invoiceId);
  if (!invoice) return null;

  const { total } = await paymentRepository.totalCollected({ invoice: invoiceId });
  const amountPaid = Number(total.toFixed(2));

  let status = invoice.status;
  if (amountPaid >= invoice.totalAmount && invoice.totalAmount > 0) status = 'paid';
  else if (amountPaid > 0) status = 'partially_paid';
  else if (status === 'paid' || status === 'partially_paid') status = 'pending';

  return invoiceRepository.updateById(invoiceId, { amountPaid, status }, userId);
}

// --- Invoices ---

async function listInvoices(query) {
  const { page, limit, skip, sort } = parsePaginationQuery(query);
  const filter = invoiceRepository.buildFilter(query);
  const { data, total } = await invoiceRepository.paginateInvoices({ filter, limit, skip, sort });
  return { data, pagination: buildPaginationMeta({ page, limit, total }) };
}

async function getInvoice(id) {
  const invoice = await invoiceRepository.findByIdPopulated(id);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  return invoice;
}

async function createInvoice(payload, userId) {
  const lineItems = payload.lineItems.map((item) => ({
    ...item,
    amount: Number((item.quantity * item.unitPrice).toFixed(2)),
  }));
  const { subtotal, totalAmount } = computeTotals({ ...payload, lineItems });

  return invoiceRepository.create({
    ...payload,
    lineItems,
    subtotal,
    totalAmount,
    invoiceNumber: payload.invoiceNumber || generateDocNumber('INV'),
    createdBy: userId,
    updatedBy: userId,
  });
}

async function updateInvoice(id, payload, userId) {
  const invoice = await invoiceRepository.findById(id);
  if (!invoice) throw ApiError.notFound('Invoice not found');

  const nextPayload = { ...payload };
  if (payload.lineItems) {
    const lineItems = payload.lineItems.map((item) => ({
      ...item,
      amount: Number((item.quantity * item.unitPrice).toFixed(2)),
    }));
    const { subtotal, totalAmount } = computeTotals({
      lineItems,
      tax: payload.tax ?? invoice.tax,
      discount: payload.discount ?? invoice.discount,
    });
    Object.assign(nextPayload, { lineItems, subtotal, totalAmount });
  }

  return invoiceRepository.updateById(id, nextPayload, userId);
}

async function deleteInvoice(id, userId) {
  const invoice = await invoiceRepository.softDeleteById(id, userId);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  return invoice;
}

// --- Payments (customer payments against invoices) ---

async function listPayments(query) {
  const { page, limit, skip, sort } = parsePaginationQuery(query);
  const filter = paymentRepository.buildFilter(query);
  const { data, total } = await paymentRepository.paginatePayments({ filter, limit, skip, sort });
  return { data, pagination: buildPaginationMeta({ page, limit, total }) };
}

async function getPayment(id) {
  const payment = await paymentRepository.findByIdPopulated(id);
  if (!payment) throw ApiError.notFound('Payment not found');
  return payment;
}

async function createPayment(payload, userId) {
  const invoice = await invoiceRepository.findById(payload.invoice);
  if (!invoice) throw ApiError.notFound('Invoice not found');

  const payment = await paymentRepository.create({
    ...payload,
    customer: payload.customer || invoice.customer,
    paymentNumber: payload.paymentNumber || generateDocNumber('PMT'),
    createdBy: userId,
    updatedBy: userId,
  });

  await syncInvoicePaidState(invoice._id, userId);

  return payment;
}

async function updatePayment(id, payload, userId) {
  const payment = await paymentRepository.updateById(id, payload, userId);
  if (!payment) throw ApiError.notFound('Payment not found');
  await syncInvoicePaidState(payment.invoice, userId);
  return payment;
}

async function deletePayment(id, userId) {
  const payment = await paymentRepository.softDeleteById(id, userId);
  if (!payment) throw ApiError.notFound('Payment not found');
  await syncInvoicePaidState(payment.invoice, userId);
  return payment;
}

// --- Carrier payments (outbound payments to vendors/carriers) ---

async function listCarrierPayments(query) {
  const { page, limit, skip, sort } = parsePaginationQuery(query);
  const filter = carrierPaymentRepository.buildFilter(query);
  const { data, total } = await carrierPaymentRepository.paginateCarrierPayments({ filter, limit, skip, sort });
  return { data, pagination: buildPaginationMeta({ page, limit, total }) };
}

async function getCarrierPayment(id) {
  const payment = await carrierPaymentRepository.findByIdPopulated(id);
  if (!payment) throw ApiError.notFound('Carrier payment not found');
  return payment;
}

async function createCarrierPayment(payload, userId) {
  return carrierPaymentRepository.create({
    ...payload,
    paymentNumber: payload.paymentNumber || generateDocNumber('CPY'),
    createdBy: userId,
    updatedBy: userId,
  });
}

async function updateCarrierPayment(id, payload, userId) {
  const payment = await carrierPaymentRepository.updateById(id, payload, userId);
  if (!payment) throw ApiError.notFound('Carrier payment not found');
  return payment;
}

async function deleteCarrierPayment(id, userId) {
  const payment = await carrierPaymentRepository.softDeleteById(id, userId);
  if (!payment) throw ApiError.notFound('Carrier payment not found');
  return payment;
}

// --- Accounting dashboard ---

async function getAccountingDashboard(query = {}) {
  const [invoiceSummary, statusBreakdown, collected, carrierPaid, carrierPending] = await Promise.all([
    invoiceRepository.summary(query),
    invoiceRepository.statusBreakdown(),
    paymentRepository.totalCollected(query),
    carrierPaymentRepository.totalPaid(query),
    carrierPaymentRepository.pendingTotal(),
  ]);

  const revenue = collected.total;
  const expenses = carrierPaid.total;

  return {
    revenue,
    expenses,
    profit: Number((revenue - expenses).toFixed(2)),
    outstandingInvoices: invoiceSummary.outstanding,
    totalInvoiced: invoiceSummary.totalInvoiced,
    invoiceCount: invoiceSummary.count,
    pendingCarrierPayments: {
      total: carrierPending.total,
      count: carrierPending.count,
    },
    invoiceStatusBreakdown: statusBreakdown.map((s) => ({
      status: s._id,
      count: s.count,
      total: s.total,
    })),
  };
}

module.exports = {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  listCarrierPayments,
  getCarrierPayment,
  createCarrierPayment,
  updateCarrierPayment,
  deleteCarrierPayment,
  getAccountingDashboard,
};
