const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const partyService = require('../services/partyService');

const LABELS = { customers: 'Customer', carriers: 'Carrier', vendors: 'Vendor' };

/**
 * Builds the five handlers for one party type (customers/carriers/vendors) so the
 * three routers stay identical apart from their permission keys.
 */
function makePartyController(type) {
  const label = LABELS[type];

  return {
    list: asyncHandler(async (req, res) => {
      const { data, pagination } = await partyService.list(type, req.query);
      return ApiResponse.success(res, { message: `${label}s fetched`, data, pagination });
    }),

    getById: asyncHandler(async (req, res) => {
      const party = await partyService.getById(type, req.params.id);
      return ApiResponse.success(res, { message: `${label} fetched`, data: party });
    }),

    create: asyncHandler(async (req, res) => {
      const party = await partyService.create(type, req.body, req.user._id);
      return ApiResponse.success(res, {
        message: `${label} created successfully`,
        data: party,
        statusCode: 201,
      });
    }),

    update: asyncHandler(async (req, res) => {
      const party = await partyService.update(type, req.params.id, req.body, req.user._id);
      return ApiResponse.success(res, { message: `${label} updated successfully`, data: party });
    }),

    remove: asyncHandler(async (req, res) => {
      await partyService.remove(type, req.params.id, req.user._id);
      return ApiResponse.success(res, { message: `${label} deleted successfully` });
    }),
  };
}

module.exports = {
  customers: makePartyController('customers'),
  carriers: makePartyController('carriers'),
  vendors: makePartyController('vendors'),
};
