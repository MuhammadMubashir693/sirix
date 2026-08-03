const diagnosticsService = require('../services/diagnosticsService');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDiagnostics = asyncHandler(async (req, res) => {
  const data = await diagnosticsService.getSystemDiagnostics();
  return apiResponse.success(res, {
    message: 'System diagnostics retrieved successfully',
    data,
  });
});

const runTest = asyncHandler(async (req, res) => {
  const { testType } = req.body;
  const result = await diagnosticsService.runDiagnosticTest(testType);
  return apiResponse.success(res, {
    message: `Diagnostic test '${testType}' completed`,
    data: result,
  });
});

module.exports = {
  getDiagnostics,
  runTest,
};