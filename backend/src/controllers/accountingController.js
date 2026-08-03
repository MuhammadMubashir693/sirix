const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const accountingService = require('../services/accountingService');

// --- Invoices ---

const listInvoices = asyncHandler(async (req, res) => {
  const { data, pagination } = await accountingService.listInvoices(req.query);
  return ApiResponse.success(res, { message: 'Invoices fetched', data, pagination });
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await accountingService.getInvoice(req.params.id);
  return ApiResponse.success(res, { message: 'Invoice fetched', data: invoice });
});

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await accountingService.createInvoice(req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Invoice created successfully', data: invoice, statusCode: 201 });
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await accountingService.updateInvoice(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Invoice updated successfully', data: invoice });
});

const deleteInvoice = asyncHandler(async (req, res) => {
  await accountingService.deleteInvoice(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: 'Invoice deleted successfully' });
});

// --- Payments ---

const listPayments = asyncHandler(async (req, res) => {
  const { data, pagination } = await accountingService.listPayments(req.query);
  return ApiResponse.success(res, { message: 'Payments fetched', data, pagination });
});

const getPayment = asyncHandler(async (req, res) => {
  const payment = await accountingService.getPayment(req.params.id);
  return ApiResponse.success(res, { message: 'Payment fetched', data: payment });
});

const createPayment = asyncHandler(async (req, res) => {
  const payment = await accountingService.createPayment(req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Payment recorded successfully', data: payment, statusCode: 201 });
});

const updatePayment = asyncHandler(async (req, res) => {
  const payment = await accountingService.updatePayment(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Payment updated successfully', data: payment });
});

const deletePayment = asyncHandler(async (req, res) => {
  await accountingService.deletePayment(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: 'Payment deleted successfully' });
});

// --- Carrier payments ---

const listCarrierPayments = asyncHandler(async (req, res) => {
  const { data, pagination } = await accountingService.listCarrierPayments(req.query);
  return ApiResponse.success(res, { message: 'Carrier payments fetched', data, pagination });
});

const getCarrierPayment = asyncHandler(async (req, res) => {
  const payment = await accountingService.getCarrierPayment(req.params.id);
  return ApiResponse.success(res, { message: 'Carrier payment fetched', data: payment });
});

const createCarrierPayment = asyncHandler(async (req, res) => {
  const payment = await accountingService.createCarrierPayment(req.body, req.user._id);
  return ApiResponse.success(res, {
    message: 'Carrier payment created successfully',
    data: payment,
    statusCode: 201,
  });
});

const updateCarrierPayment = asyncHandler(async (req, res) => {
  const payment = await accountingService.updateCarrierPayment(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Carrier payment updated successfully', data: payment });
});

const deleteCarrierPayment = asyncHandler(async (req, res) => {
  await accountingService.deleteCarrierPayment(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: 'Carrier payment deleted successfully' });
});

// --- Dashboard ---

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await accountingService.getAccountingDashboard(req.query);
  return ApiResponse.success(res, { message: 'Accounting dashboard fetched', data: dashboard });
});

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
  getDashboard,
};
