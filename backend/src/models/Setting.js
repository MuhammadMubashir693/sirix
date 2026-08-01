const mongoose = require('mongoose');
const auditablePlugin = require('./plugins/auditable');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // e.g. "general.company_name", "notifications.email_enabled"
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    type: {
      type: String,
      required: true,
      enum: ['string', 'number', 'boolean', 'json'],
      default: 'string',
    },
    group: { type: String, required: true, trim: true, default: 'general' },
    description: { type: String, trim: true },
    isPublic: { type: Boolean, default: false }, // readable by non-admin authenticated users (e.g. dashboard refresh interval)
  },
  { timestamps: true }
);

settingSchema.plugin(auditablePlugin);

settingSchema.index({ group: 1 });

module.exports = mongoose.model('Setting', settingSchema);
