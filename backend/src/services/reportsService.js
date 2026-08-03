const invoiceRepository = require('../repositories/invoiceRepository');
const paymentRepository = require('../repositories/paymentRepository');
const carrierPaymentRepository = require('../repositories/carrierPaymentRepository');
const ApiError = require('../utils/ApiError');

function buildDateFilter(query = {}) {
  const filter = {};
  if (query.from || query.to) {
    filter.issueDate = {};
    if (query.from) filter.issueDate.$gte = new Date(query.from);
    if (query.to) filter.issueDate.$lte = new Date(query.to);
  }
  return filter;
}

async function getRevenueReport(query = {}) {
  const [invoiceSummary, paymentSummary] = await Promise.all([
    invoiceRepository.summary(query),
    paymentRepository.totalCollected(query),
  ]);

  return {
    totalRevenue: Number((paymentSummary.total || 0).toFixed(2)),
    totalInvoiced: Number((invoiceSummary.totalInvoiced || 0).toFixed(2)),
    outstanding: Number((invoiceSummary.outstanding || 0).toFixed(2)),
    periods: [
      {
        label: 'Current period',
        revenue: Number((paymentSummary.total || 0).toFixed(2)),
        invoiced: Number((invoiceSummary.totalInvoiced || 0).toFixed(2)),
      },
    ],
  };
}

async function getProfitReport(query = {}) {
  const [revenue, expenses] = await Promise.all([
    paymentRepository.totalCollected(query),
    carrierPaymentRepository.totalPaid(query),
  ]);

  const totalProfit = Number((revenue.total - expenses.total).toFixed(2));

  return {
    totalRevenue: Number((revenue.total || 0).toFixed(2)),
    totalExpenses: Number((expenses.total || 0).toFixed(2)),
    totalProfit,
    periods: [
      {
        label: 'Current period',
        revenue: Number((revenue.total || 0).toFixed(2)),
        expenses: Number((expenses.total || 0).toFixed(2)),
        profit: totalProfit,
      },
    ],
  };
}

async function getCustomerReport(query = {}) {
  const filter = buildDateFilter(query);
  const invoices = await invoiceRepository.model
    .find(filter)
    .populate('customer', 'name email')
    .sort({ totalAmount: -1 })
    .limit(10)
    .lean();

  return {
    items: invoices.map((invoice) => ({
      id: invoice._id,
      name: invoice.customer?.name || 'Unknown customer',
      email: invoice.customer?.email || '—',
      total: Number((invoice.totalAmount || 0).toFixed(2)),
      status: invoice.status,
      paid: Number((invoice.amountPaid || 0).toFixed(2)),
    })),
  };
}

async function getCarrierReport(query = {}) {
  const filter = buildDateFilter(query);
  const invoices = await invoiceRepository.model
    .find(filter)
    .populate('carrier', 'name')
    .sort({ totalAmount: -1 })
    .limit(10)
    .lean();

  return {
    items: invoices.map((invoice) => ({
      id: invoice._id,
      name: invoice.carrier?.name || 'Unassigned carrier',
      total: Number((invoice.totalAmount || 0).toFixed(2)),
      status: invoice.status,
    })),
  };
}

async function getVendorReport(query = {}) {
  const filter = buildDateFilter(query);
  const payments = await carrierPaymentRepository.model
    .find(filter)
    .populate('vendor', 'name')
    .sort({ amount: -1 })
    .limit(10)
    .lean();

  return {
    items: payments.map((payment) => ({
      id: payment._id,
      name: payment.vendor?.name || 'Unassigned vendor',
      amount: Number((payment.amount || 0).toFixed(2)),
      status: payment.status,
    })),
  };
}

module.exports = {
  getRevenueReport,
  getProfitReport,
  getCustomerReport,
  getCarrierReport,
  getVendorReport,
};
