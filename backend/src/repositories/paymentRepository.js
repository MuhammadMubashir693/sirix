const BaseRepository = require('./BaseRepository');
const Payment = require('../models/Payment');

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  buildFilter({ search, status, method, invoice, customer, from, to } = {}) {
    const filter = {};

    if (search) filter.paymentNumber = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (invoice) filter.invoice = invoice;
    if (customer) filter.customer = customer;
    if (from || to) {
      filter.paidAt = {};
      if (from) filter.paidAt.$gte = new Date(from);
      if (to) filter.paidAt.$lte = new Date(to);
    }

    return filter;
  }

  paginatePayments({ filter, limit, skip, sort }) {
    return this.paginate({
      filter,
      limit,
      skip,
      sort,
      populate: [
        { path: 'invoice', select: 'invoiceNumber totalAmount status' },
        { path: 'customer', select: 'name email' },
      ],
    });
  }

  findByIdPopulated(id) {
    return this.findById(id, {
      populate: [
        { path: 'invoice', select: 'invoiceNumber totalAmount status' },
        { path: 'customer', select: 'name email' },
      ],
    });
  }

  async totalCollected({ from, to } = {}) {
    const match = { status: 'completed' };
    if (from || to) {
      match.paidAt = {};
      if (from) match.paidAt.$gte = new Date(from);
      if (to) match.paidAt.$lte = new Date(to);
    }
    const [result] = await this.model.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    return result || { total: 0, count: 0 };
  }
}

module.exports = new PaymentRepository();
