const mongoose = require('mongoose');
const auditablePlugin = require('./plugins/auditable');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Admin, Manager, Accounting, Operations, Viewer (extensible)
    },
    description: { type: String, trim: true },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    isSystem: { type: Boolean, default: false }, // prevents deletion of built-in roles
  },
  { timestamps: true }
);

roleSchema.plugin(auditablePlugin);

module.exports = mongoose.model('Role', roleSchema);
