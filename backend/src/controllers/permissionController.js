const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const permissionService = require('../services/permissionService');

const list = asyncHandler(async (req, res) => {
  const permissions = await permissionService.listPermissions();
  return ApiResponse.success(res, { message: 'Permissions fetched', data: permissions });
});

const getById = asyncHandler(async (req, res) => {
  const permission = await permissionService.getPermissionById(req.params.id);
  return ApiResponse.success(res, { message: 'Permission fetched', data: permission });
});

const create = asyncHandler(async (req, res) => {
  const permission = await permissionService.createPermission(req.body, req.user._id);
  return ApiResponse.success(res, {
    message: 'Permission created successfully',
    data: permission,
    statusCode: 201,
  });
});

const update = asyncHandler(async (req, res) => {
  const permission = await permissionService.updatePermission(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Permission updated successfully', data: permission });
});

const remove = asyncHandler(async (req, res) => {
  await permissionService.deletePermission(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: 'Permission deleted successfully' });
});

module.exports = { list, getById, create, update, remove };
