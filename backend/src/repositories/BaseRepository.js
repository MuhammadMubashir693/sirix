/**
 * Generic repository wrapping a Mongoose model with common CRUD + pagination helpers.
 * Module-specific repositories extend this for custom queries.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(data) {
    return this.model.create(data);
  }

  findById(id, { populate } = {}) {
    let query = this.model.findById(id);
    if (populate) query = query.populate(populate);
    return query;
  }

  findOne(filter, { populate } = {}) {
    let query = this.model.findOne(filter);
    if (populate) query = query.populate(populate);
    return query;
  }

  async paginate({ filter = {}, limit = 20, skip = 0, sort = { createdAt: -1 }, populate }) {
    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);
    if (populate) query = query.populate(populate);
    const [data, total] = await Promise.all([query, this.model.countDocuments(filter)]);
    return { data, total };
  }

  async updateById(id, update, userId) {
    return this.model.findByIdAndUpdate(
      id,
      { ...update, updatedBy: userId },
      { new: true, runValidators: true }
    );
  }

  async softDeleteById(id, userId) {
    const doc = await this.model.findById(id);
    if (!doc) return null;
    await doc.softDelete(userId);
    return doc;
  }
}

module.exports = BaseRepository;
