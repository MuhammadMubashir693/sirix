const mongoose = require('mongoose');
const auditablePlugin = require('./plugins/auditable');

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },

    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: 'USD', trim: true, uppercase: true },

    method: {
      type: String,
      enum: ['bank_transfer', 'card', 'wire', 'cheque', 'cash', 'other'],
      required: true,
    },
    reference: { type: String, trim: true },

    paidAt: { type: Date, required: true, default: Date.now },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
      index: true,
    },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

paymentSchema.plugin(auditablePlugin);

paymentSchema.index({ invoice: 1 });
paymentSchema.index({ paidAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
