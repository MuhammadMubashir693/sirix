const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const reportsService = require('../services/reportsService');

const getRevenueReport = asyncHandler(async (req, res) => {
  const report = await reportsService.getRevenueReport(req.query);
  return ApiResponse.success(res, { message: 'Revenue report generated', data: report });
});

const getProfitReport = asyncHandler(async (req, res) => {
  const report = await reportsService.getProfitReport(req.query);
  return ApiResponse.success(res, { message: 'Profit report generated', data: report });
});

const getCustomerReport = asyncHandler(async (req, res) => {
  const report = await reportsService.getCustomerReport(req.query);
  return ApiResponse.success(res, { message: 'Customer report generated', data: report });
});

const getCarrierReport = asyncHandler(async (req, res) => {
  const report = await reportsService.getCarrierReport(req.query);
  return ApiResponse.success(res, { message: 'Carrier report generated', data: report });
});

const getVendorReport = asyncHandler(async (req, res) => {
  const report = await reportsService.getVendorReport(req.query);
  return ApiResponse.success(res, { message: 'Vendor report generated', data: report });
});

module.exports = {
  getRevenueReport,
  getProfitReport,
  getCustomerReport,
  getCarrierReport,
  getVendorReport,
};
