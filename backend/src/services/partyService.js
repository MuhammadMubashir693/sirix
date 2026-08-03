const { partyRepositories } = require('../repositories/partyRepository');
const { parsePaginationQuery, buildPaginationMeta } = require('../utils/pagination');
const ApiError = require('../utils/ApiError');

const LABELS = { customers: 'Customer', carriers: 'Carrier', vendors: 'Vendor' };

function repositoryFor(type) {
  const repository = partyRepositories[type];
  if (!repository) throw ApiError.badRequest(`Unknown party type: ${type}`);
  return repository;
}

async function list(type, query) {
  const repository = repositoryFor(type);
  const { page, limit, skip, sort } = parsePaginationQuery(query);
  const { data, total } = await repository.paginate({
    filter: repository.buildFilter(query),
    limit,
    skip,
    sort: query.sortBy ? sort : { name: 1 },
  });
  return { data, pagination: buildPaginationMeta({ page, limit, total }) };
}

async function getById(type, id) {
  const party = await repositoryFor(type).findById(id);
  if (!party) throw ApiError.notFound(`${LABELS[type]} not found`);
  return party;
}

async function create(type, payload, userId) {
  const repository = repositoryFor(type);
  const duplicate = await repository.findOne(
    type === 'customers' ? { email: payload.email } : { $or: [{ name: payload.name }, { code: payload.code }] }
  );
  if (duplicate) throw ApiError.conflict(`${LABELS[type]} already exists`);

  return repository.create({ ...payload, createdBy: userId, updatedBy: userId });
}

async function update(type, id, payload, userId) {
  const party = await repositoryFor(type).updateById(id, payload, userId);
  if (!party) throw ApiError.notFound(`${LABELS[type]} not found`);
  return party;
}

async function remove(type, id, userId) {
  const party = await repositoryFor(type).softDeleteById(id, userId);
  if (!party) throw ApiError.notFound(`${LABELS[type]} not found`);
  return party;
}

module.exports = { list, getById, create, update, remove };
