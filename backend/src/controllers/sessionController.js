const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const sessionService = require('../services/sessionService');

const list = asyncHandler(async (req, res) => {
  const { data, pagination } = await sessionService.listSessions(req.query);
  return ApiResponse.success(res, { message: 'Sessions fetched', data, pagination });
});

const revoke = asyncHandler(async (req, res) => {
  await sessionService.revokeSession(req.params.id);
  return ApiResponse.success(res, { message: 'Session revoked successfully' });
});

const revokeAllForUser = asyncHandler(async (req, res) => {
  await sessionService.revokeAllSessionsForUser(req.params.userId);
  return ApiResponse.success(res, { message: 'All sessions revoked for user' });
});

module.exports = { list, revoke, revokeAllForUser };
