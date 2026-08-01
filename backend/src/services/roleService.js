const roleRepository = require('../repositories/roleRepository');
const Permission = require('../models/Permission');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

async function listRoles() {
  return roleRepository.findAllWithPermissions();
}

async function getRoleById(id) {
  const role = await roleRepository.findByIdWithPermissions(id);
  if (!role) throw ApiError.notFound('Role not found');
  return role;
}

async function validatePermissionIds(permissionIds = []) {
  if (!permissionIds.length) return [];
  const found = await Permission.find({ _id: { $in: permissionIds } });
  if (found.length !== permissionIds.length) {
    throw ApiError.badRequest('One or more permission IDs are invalid');
  }
  return found.map((p) => p._id);
}

async function createRole({ name, description, permissions }, createdBy) {
  const existing = await roleRepository.findByName(name);
  if (existing) throw ApiError.conflict('A role with this name already exists');

  const permissionIds = await validatePermissionIds(permissions);

  const role = await roleRepository.create({
    name,
    description,
    permissions: permissionIds,
    createdBy,
    updatedBy: createdBy,
  });

  return roleRepository.findByIdWithPermissions(role._id);
}

async function updateRole(id, { name, description, permissions }, updatedBy) {
  const role = await roleRepository.model.findById(id);
  if (!role) throw ApiError.notFound('Role not found');

  if (role.isSystem && name && name !== role.name) {
    throw ApiError.forbidden('Built-in roles cannot be renamed');
  }

  if (name && name !== role.name) {
    const existing = await roleRepository.findByName(name);
    if (existing) throw ApiError.conflict('A role with this name already exists');
    role.name = name;
  }

  if (description !== undefined) role.description = description;

  if (permissions !== undefined) {
    role.permissions = await validatePermissionIds(permissions);
  }

  role.updatedBy = updatedBy;
  await role.save();

  return roleRepository.findByIdWithPermissions(role._id);
}

async function deleteRole(id, deletedBy) {
  const role = await roleRepository.model.findById(id);
  if (!role) throw ApiError.notFound('Role not found');

  if (role.isSystem) throw ApiError.forbidden('Built-in roles cannot be deleted');

  const usersWithRole = await User.countDocuments({ role: id });
  if (usersWithRole > 0) {
    throw ApiError.conflict(`Cannot delete role: ${usersWithRole} user(s) are still assigned to it`);
  }

  await role.softDelete(deletedBy);
}

module.exports = { listRoles, getRoleById, createRole, updateRole, deleteRole };
