const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const settingService = require('../services/settingService');

const list = asyncHandler(async (req, res) => {
  const settings = await settingService.listSettings(req.query);
  return ApiResponse.success(res, { message: 'Settings fetched', data: settings });
});

const getByKey = asyncHandler(async (req, res) => {
  const setting = await settingService.getSetting(req.params.key);
  return ApiResponse.success(res, { message: 'Setting fetched', data: setting });
});

const upsert = asyncHandler(async (req, res) => {
  const setting = await settingService.upsertSetting(req.params.key, req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Setting saved successfully', data: setting });
});

const bulkUpsert = asyncHandler(async (req, res) => {
  const settings = await settingService.bulkUpsertSettings(req.body.settings, req.user._id);
  return ApiResponse.success(res, { message: 'Settings saved successfully', data: settings });
});

const remove = asyncHandler(async (req, res) => {
  await settingService.deleteSetting(req.params.key, req.user._id);
  return ApiResponse.success(res, { message: 'Setting deleted successfully' });
});

module.exports = { list, getByKey, upsert, bulkUpsert, remove };
