const BaseRepository = require('./BaseRepository');
const Setting = require('../models/Setting');

class SettingRepository extends BaseRepository {
  constructor() {
    super(Setting);
  }

  findByKey(key) {
    return this.model.findOne({ key: key.toLowerCase() });
  }

  findAll({ group } = {}) {
    const filter = group ? { group } : {};
    return this.model.find(filter).sort({ group: 1, key: 1 });
  }

  async upsert(key, update, userId) {
    return this.model.findOneAndUpdate(
      { key: key.toLowerCase() },
      { ...update, key: key.toLowerCase(), updatedBy: userId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
}

module.exports = new SettingRepository();
