const BaseRepository = require('./BaseRepository');
const CarrierPayment = require('../models/CarrierPayment');

class CarrierPaymentRepository extends BaseRepository {
  constructor() {
    super(CarrierPayment);
  }

  buildFilter({ search, status, method, carrier, vendor, from, to } = {}) {
    const filter = {};

    if (search) filter.paymentNumber = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (carrier) filter.carrier = carrier;
    if (vendor) filter.vendor = vendor;
    if (from || to) {
      filter.paidAt = {};
      if (from) filter.paidAt.$gte = new Date(from);
      if (to) filter.paidAt.$lte = new Date(to);
    }

    return filter;
  }

  paginateCarrierPayments({ filter, limit, skip, sort }) {
    return this.paginate({
      filter,
      limit,
      skip,
      sort,
      populate: [
        { path: 'carrier', select: 'name' },
        { path: 'vendor', select: 'name' },
      ],
    });
  }

  findByIdPopulated(id) {
    return this.findById(id, {
      populate: [
        { path: 'carrier', select: 'name' },
        { path: 'vendor', select: 'name' },
      ],
    });
  }

  async totalPaid({ from, to } = {}) {
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

  async pendingTotal() {
    const [result] = await this.model.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    return result || { total: 0, count: 0 };
  }
}

module.exports = new CarrierPaymentRepository();
