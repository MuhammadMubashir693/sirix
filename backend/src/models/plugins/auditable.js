const mongoose = require('mongoose');

/**
 * Adds createdBy/updatedBy references and soft-delete fields (isDeleted, deletedAt, deletedBy)
 * to any schema. Also patches common query helpers to exclude soft-deleted docs by default.
 */
function auditablePlugin(schema) {
  schema.add({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  });

  schema.methods.softDelete = function softDelete(userId) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    return this.save();
  };

  const excludeDeleted = function excludeDeleted(next) {
    // Only auto-filter if the query hasn't explicitly asked to include deleted docs
    if (this.getFilter().includeDeleted) {
      const filter = this.getFilter();
      delete filter.includeDeleted;
    } else if (this.getFilter().isDeleted === undefined) {
      this.where({ isDeleted: { $ne: true } });
    }
    next();
  };

  ['find', 'findOne', 'countDocuments', 'findOneAndUpdate', 'updateMany', 'updateOne'].forEach((method) => {
    schema.pre(method, excludeDeleted);
  });

  // Aggregations bypass query middleware, so soft-deleted docs have to be
  // filtered out of the pipeline explicitly.
  schema.pre('aggregate', function excludeDeletedFromPipeline(next) {
    if (this.options.includeDeleted) return next();
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    return next();
  });
}

module.exports = auditablePlugin;
