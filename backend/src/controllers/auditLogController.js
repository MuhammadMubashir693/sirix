const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const auditLogService = require('../services/auditLogService');

const list = asyncHandler(async (req, res) => {
  const { data, pagination } = await auditLogService.listAuditLogs(req.query);
  return ApiResponse.success(res, { message: 'Audit logs fetched', data, pagination });
});

const getById = asyncHandler(async (req, res) => {
  const log = await auditLogService.getAuditLogById(req.params.id);
  return ApiResponse.success(res, { message: 'Audit log entry fetched', data: log });
});

module.exports = { list, getById };
