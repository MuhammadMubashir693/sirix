const BaseRepository = require('./BaseRepository');
const Permission = require('../models/Permission');

class PermissionRepository extends BaseRepository {
  constructor() {
    super(Permission);
  }

  findByKey(key) {
    return this.model.findOne({ key: key.toLowerCase() });
  }

  findAllGrouped() {
    return this.model.find().sort({ module: 1, action: 1 });
  }
}

module.exports = new PermissionRepository();
