const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const roleService = require('../services/roleService');

const list = asyncHandler(async (req, res) => {
  const roles = await roleService.listRoles();
  return ApiResponse.success(res, { message: 'Roles fetched', data: roles });
});

const getById = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  return ApiResponse.success(res, { message: 'Role fetched', data: role });
});

const create = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Role created successfully', data: role, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, { message: 'Role updated successfully', data: role });
});

const remove = asyncHandler(async (req, res) => {
  await roleService.deleteRole(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: 'Role deleted successfully' });
});

module.exports = { list, getById, create, update, remove };
