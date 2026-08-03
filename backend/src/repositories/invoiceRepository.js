const BaseRepository = require('./BaseRepository');
const Invoice = require('../models/Invoice');

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(Invoice);
  }

  buildFilter({ search, status, customer, carrier, from, to } = {}) {
    const filter = {};

    if (search) {
      filter.invoiceNumber = { $regex: search, $options: 'i' };
    }
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (carrier) filter.carrier = carrier;
    if (from || to) {
      filter.issueDate = {};
      if (from) filter.issueDate.$gte = new Date(from);
      if (to) filter.issueDate.$lte = new Date(to);
    }

    return filter;
  }

  paginateInvoices({ filter, limit, skip, sort }) {
    return this.paginate({
      filter,
      limit,
      skip,
      sort,
      populate: [
        { path: 'customer', select: 'name email' },
        { path: 'carrier', select: 'name' },
      ],
    });
  }

  findByIdPopulated(id) {
    return this.findById(id, {
      populate: [
        { path: 'customer', select: 'name email' },
        { path: 'carrier', select: 'name' },
      ],
    });
  }

  findByInvoiceNumber(invoiceNumber) {
    return this.model.findOne({ invoiceNumber: invoiceNumber.toUpperCase() });
  }

  async summary({ from, to } = {}) {
    const match = {};
    if (from || to) {
      match.issueDate = {};
      if (from) match.issueDate.$gte = new Date(from);
      if (to) match.issueDate.$lte = new Date(to);
    }

    const [result] = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$amountPaid' },
          outstanding: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } },
          count: { $sum: 1 },
        },
      },
    ]);

    return result || { totalInvoiced: 0, totalCollected: 0, outstanding: 0, count: 0 };
  }

  async statusBreakdown() {
    return this.model.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
    ]);
  }
}

module.exports = new InvoiceRepository();
