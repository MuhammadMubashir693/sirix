const auditLogRepository = require('../repositories/auditLogRepository');
const ApiError = require('../utils/ApiError');
const { parsePaginationQuery, buildPaginationMeta } = require('../utils/pagination');

async function listAuditLogs(query) {
  const { page, limit, skip, sort } = parsePaginationQuery(query);
  const filter = auditLogRepository.buildFilter(query);

  const { data, total } = await auditLogRepository.paginateWithUser({ filter, limit, skip, sort });

  return { data, pagination: buildPaginationMeta({ page, limit, total }) };
}

async function getAuditLogById(id) {
  const log = await auditLogRepository.findById(id, {
    populate: { path: 'user', select: 'firstName lastName email' },
  });
  if (!log) throw ApiError.notFound('Audit log entry not found');
  return log;
}

module.exports = { listAuditLogs, getAuditLogById };
