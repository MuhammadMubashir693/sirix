const mongoose = require('mongoose');
const auditablePlugin = require('./plugins/auditable');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, trim: true, uppercase: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

vendorSchema.plugin(auditablePlugin);
vendorSchema.index({ name: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
