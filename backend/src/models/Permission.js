const mongoose = require('mongoose');
const auditablePlugin = require('./plugins/auditable');

const permissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // e.g. "invoices:create", "diagnostics:read"
    },
    module: { type: String, required: true, trim: true },
    action: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete', 'manage', 'export'],
    },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

permissionSchema.plugin(auditablePlugin);

permissionSchema.index({ module: 1, action: 1 });

module.exports = mongoose.model('Permission', permissionSchema);
