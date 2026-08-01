/**
 * Parses page/limit/sort/search query params into a consistent shape,
 * and builds the pagination metadata object for responses.
 */
function parsePaginationQuery(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  let sort = { createdAt: -1 };
  if (query.sortBy) {
    const direction = query.sortOrder === 'asc' ? 1 : -1;
    sort = { [query.sortBy]: direction };
  }

  return { page, limit, skip, sort };
}

function buildPaginationMeta({ page, limit, total }) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePaginationQuery, buildPaginationMeta };
