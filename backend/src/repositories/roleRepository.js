const BaseRepository = require('./BaseRepository');
const Role = require('../models/Role');

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  findByName(name) {
    return this.model.findOne({ name });
  }

  findAllWithPermissions() {
    return this.model.find().populate('permissions').sort({ name: 1 });
  }

  findByIdWithPermissions(id) {
    return this.model.findById(id).populate('permissions');
  }
}

module.exports = new RoleRepository();
