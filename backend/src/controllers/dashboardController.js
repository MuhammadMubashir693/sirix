const dashboardService = require('../services/dashboardService');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardMetrics = asyncHandler(async (req, res) => {
  const metrics = await dashboardService.getMetrics();
  return apiResponse.success(res, 'Dashboard metrics retrieved successfully', metrics);
});

module.exports = {
  getDashboardMetrics,
};