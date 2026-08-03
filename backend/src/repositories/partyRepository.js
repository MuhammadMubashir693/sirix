const BaseRepository = require('./BaseRepository');
const Customer = require('../models/Customer');
const Carrier = require('../models/Carrier');
const Vendor = require('../models/Vendor');

/**
 * Customers, carriers and vendors are the counterparties invoices and payments
 * point at. Their schemas are near-identical, so one repository class serves all
 * three; `partyRepositories` maps a party type to its instance.
 */
class PartyRepository extends BaseRepository {
  buildFilter({ search, status } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    }
    return filter;
  }
}

const partyRepositories = {
  customers: new PartyRepository(Customer),
  carriers: new PartyRepository(Carrier),
  vendors: new PartyRepository(Vendor),
};

module.exports = { PartyRepository, partyRepositories };
