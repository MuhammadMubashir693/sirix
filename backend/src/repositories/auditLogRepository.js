const BaseRepository = require('./BaseRepository');
const AuditLog = require('../models/AuditLog');

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  buildFilter({ module, action, user, from, to, search }) {
    const filter = {};
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (user) filter.user = user;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { module: { $regex: search, $options: 'i' } },
        { path: { $regex: search, $options: 'i' } },
      ];
    }
    return filter;
  }

  paginateWithUser({ filter, limit, skip, sort }) {
    return this.paginate({ filter, limit, skip, sort, populate: { path: 'user', select: 'firstName lastName email' } });
  }
}

module.exports = new AuditLogRepository();
