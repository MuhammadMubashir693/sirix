const RefreshToken = require('../models/RefreshToken');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const ApiError = require('../utils/ApiError');
const { parsePaginationQuery, buildPaginationMeta } = require('../utils/pagination');

async function listSessions(query) {
  const { page, limit, skip, sort } = parsePaginationQuery(query);
  const filter = { revoked: false, expiresAt: { $gt: new Date() } };
  if (query.userId) filter.user = query.userId;

  const [data, total] = await Promise.all([
    RefreshToken.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'user', select: 'firstName lastName email' }),
    RefreshToken.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta({ page, limit, total }) };
}

async function revokeSession(id) {
  const session = await RefreshToken.findById(id);
  if (!session) throw ApiError.notFound('Session not found');
  if (session.revoked) throw ApiError.badRequest('Session is already revoked');

  session.revoked = true;
  session.revokedAt = new Date();
  await session.save();
}

async function revokeAllSessionsForUser(userId) {
  await refreshTokenRepository.revokeAllForUser(userId);
}

module.exports = { listSessions, revokeSession, revokeAllSessionsForUser };
