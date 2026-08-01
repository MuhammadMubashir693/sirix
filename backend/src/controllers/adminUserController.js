const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const adminUserService = require('../services/adminUserService');

const list = asyncHandler(async (req, res) => {
  const { data, pagination } = await adminUserService.listUsers(req.query);
  return ApiResponse.success(res, { message: 'Users fetched', data, pagination });
});

const getById = asyncHandler(async (req, res) => {
  const user = await adminUserService.getUserById(req.params.id);
  return ApiResponse.success(res, { message: 'User fetched', data: user });
});

const create = asyncHandler(async (req, res) => {
  const user = await adminUserService.createUser(req.body, req.user._id);
  return ApiResponse.success(res, { message: 'User created successfully', data: user, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const user = await adminUserService.updateUser(req.params.id, req.body, req.user._id);
  return ApiResponse.success(res, { message: 'User updated successfully', data: user });
});

const setStatus = asyncHandler(async (req, res) => {
  const user = await adminUserService.setUserStatus(req.params.id, req.body.isActive, req.user._id);
  return ApiResponse.success(res, {
    message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user,
  });
});

const remove = asyncHandler(async (req, res) => {
  await adminUserService.deleteUser(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: 'User deleted successfully' });
});

module.exports = { list, getById, create, update, setStatus, remove };
