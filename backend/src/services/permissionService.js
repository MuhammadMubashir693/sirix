const permissionRepository = require('../repositories/permissionRepository');
const Role = require('../models/Role');
const ApiError = require('../utils/ApiError');

async function listPermissions() {
  return permissionRepository.findAllGrouped();
}

async function getPermissionById(id) {
  const permission = await permissionRepository.findById(id);
  if (!permission) throw ApiError.notFound('Permission not found');
  return permission;
}

async function createPermission({ module, action, description }, createdBy) {
  const key = `${module}:${action}`.toLowerCase();
  const existing = await permissionRepository.findByKey(key);
  if (existing) throw ApiError.conflict('A permission with this module/action already exists');

  return permissionRepository.create({
    key,
    module,
    action,
    description,
    createdBy,
    updatedBy: createdBy,
  });
}

async function updatePermission(id, { description }, updatedBy) {
  const permission = await permissionRepository.findById(id);
  if (!permission) throw ApiError.notFound('Permission not found');

  // module/action/key are immutable once created since roles reference the key directly
  if (description !== undefined) permission.description = description;
  permission.updatedBy = updatedBy;
  await permission.save();

  return permission;
}

async function deletePermission(id, deletedBy) {
  const permission = await permissionRepository.findById(id);
  if (!permission) throw ApiError.notFound('Permission not found');

  const rolesUsingIt = await Role.countDocuments({ permissions: id });
  if (rolesUsingIt > 0) {
    throw ApiError.conflict(`Cannot delete permission: it is assigned to ${rolesUsingIt} role(s)`);
  }

  await permission.softDelete(deletedBy);
}

module.exports = { listPermissions, getPermissionById, createPermission, updatePermission, deletePermission };
