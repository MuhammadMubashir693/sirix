const mongoose = require('mongoose');
const auditablePlugin = require('./plugins/auditable');

const invoiceLineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    carrier: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier' },

    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },

    lineItems: { type: [invoiceLineItemSchema], required: true, validate: (v) => Array.isArray(v) && v.length > 0 },

    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },

    currency: { type: String, default: 'USD', trim: true, uppercase: true },

    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled'],
      default: 'pending',
      index: true,
    },

    notes: { type: String, trim: true },
    pdfUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

invoiceSchema.plugin(auditablePlugin);

invoiceSchema.index({ customer: 1, status: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ dueDate: 1 });

invoiceSchema.virtual('outstandingBalance').get(function outstandingBalance() {
  return Math.max(this.totalAmount - this.amountPaid, 0);
});

invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
