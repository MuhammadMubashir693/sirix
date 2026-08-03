const mongoose = require('mongoose');
const auditablePlugin = require('./plugins/auditable');

const carrierPaymentSchema = new mongoose.Schema(
  {
    paymentNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    carrier: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },

    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: 'USD', trim: true, uppercase: true },

    method: {
      type: String,
      enum: ['bank_transfer', 'wire', 'cheque', 'cash', 'other'],
      required: true,
    },
    reference: { type: String, trim: true },

    billingPeriodStart: { type: Date },
    billingPeriodEnd: { type: Date },

    paidAt: { type: Date, required: true, default: Date.now },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

carrierPaymentSchema.plugin(auditablePlugin);

// A payment must target either a carrier or a vendor.
carrierPaymentSchema.pre('validate', function requireTarget(next) {
  if (!this.carrier && !this.vendor) {
    return next(new Error('Carrier payment must reference a carrier or a vendor'));
  }
  next();
});

carrierPaymentSchema.index({ carrier: 1 });
carrierPaymentSchema.index({ vendor: 1 });
carrierPaymentSchema.index({ paidAt: -1 });

module.exports = mongoose.model('CarrierPayment', carrierPaymentSchema);
