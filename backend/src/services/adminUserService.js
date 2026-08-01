const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const Role = require('../models/Role');
const ApiError = require('../utils/ApiError');
const { parsePaginationQuery, buildPaginationMeta } = require('../utils/pagination');

function buildUserFilter({ search, role, isActive }) {
  const filter = {};
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
  return filter;
}

async function listUsers(query) {
  const { page, limit, skip, sort } = parsePaginationQuery(query);
  const filter = buildUserFilter(query);

  const { data, total } = await userRepository.paginate({
    filter,
    limit,
    skip,
    sort,
    populate: { path: 'role', populate: { path: 'permissions' } },
  });

  return {
    data: data.map((user) => user.toSafeObject()),
    pagination: buildPaginationMeta({ page, limit, total }),
  };
}

async function getUserById(id) {
  const user = await userRepository.findByIdWithRole(id);
  if (!user) throw ApiError.notFound('User not found');
  return user.toSafeObject();
}

async function createUser({ firstName, lastName, email, password, roleId, phone }, createdBy) {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const role = await Role.findById(roleId);
  if (!role) throw ApiError.badRequest('Invalid roleId');

  const user = await userRepository.create({
    firstName,
    lastName,
    email,
    password,
    role: role._id,
    phone,
    createdBy,
    updatedBy: createdBy,
  });

  const fullUser = await userRepository.findByIdWithRole(user._id);
  return fullUser.toSafeObject();
}

async function updateUser(id, updates, updatedBy) {
  const user = await userRepository.model.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  if (updates.roleId) {
    const role = await Role.findById(updates.roleId);
    if (!role) throw ApiError.badRequest('Invalid roleId');
    user.role = role._id;
  }

  ['firstName', 'lastName', 'phone', 'avatarUrl'].forEach((field) => {
    if (updates[field] !== undefined) user[field] = updates[field];
  });

  if (updates.email && updates.email !== user.email) {
    const existing = await userRepository.findByEmail(updates.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');
    user.email = updates.email;
  }

  user.updatedBy = updatedBy;
  await user.save();

  const fullUser = await userRepository.findByIdWithRole(user._id);
  return fullUser.toSafeObject();
}

async function setUserStatus(id, isActive, updatedBy) {
  const user = await userRepository.model.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  user.isActive = isActive;
  user.updatedBy = updatedBy;
  await user.save();

  if (!isActive) {
    // Deactivating a user should immediately end all of their active sessions
    await refreshTokenRepository.revokeAllForUser(id);
  }

  const fullUser = await userRepository.findByIdWithRole(user._id);
  return fullUser.toSafeObject();
}

async function deleteUser(id, deletedBy) {
  const user = await userRepository.model.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  await user.softDelete(deletedBy);
  await refreshTokenRepository.revokeAllForUser(id);
}

module.exports = { listUsers, getUserById, createUser, updateUser, setUserStatus, deleteUser };
