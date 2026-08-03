const mongoose = require('mongoose');
const auditablePlugin = require('./plugins/auditable');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

customerSchema.plugin(auditablePlugin);
customerSchema.index({ name: 1 });

module.exports = mongoose.model('Customer', customerSchema);
