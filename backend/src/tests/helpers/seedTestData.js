const Role = require('../../models/Role');
const Permission = require('../../models/Permission');
const User = require('../../models/User');

async function seedViewerRole() {
  return Role.create({ name: 'Viewer', isSystem: true, permissions: [] });
}

async function seedAdminRole() {
  const perm = await Permission.create({ key: 'users:manage', module: 'users', action: 'manage' });
  return Role.create({ name: 'Admin', isSystem: true, permissions: [perm._id] });
}

async function createTestUser(overrides = {}) {
  const role = overrides.role || (await seedViewerRole());
  return User.create({
    firstName: 'Test',
    lastName: 'User',
    email: overrides.email || 'test.user@example.com',
    password: overrides.password || 'Password123',
    role: role._id,
    ...overrides,
  });
}

module.exports = { seedViewerRole, seedAdminRole, createTestUser };
