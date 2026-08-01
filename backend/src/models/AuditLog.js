const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g. "USER_LOGIN", "INVOICE_CREATE"
    module: { type: String, required: true },
    method: { type: String },
    path: { type: String },
    statusCode: { type: Number },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
