/* eslint-disable no-console */
require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/database');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');

const MODULES = [
  'users',
  'roles',
  'permissions',
  'carriers',
  'vendors',
  'customers',
  'numbering',
  'diagnostics',
  'invoices',
  'payments',
  'carrier-payments',
  'relationship-performance',
  'reports',
  'dashboard',
  'audit-logs',
  'notifications',
  'settings',
  'sessions',
];
const ACTIONS = ['create', 'read', 'update', 'delete', 'manage', 'export'];

const ROLE_DEFINITIONS = {
  Admin: () => true, // all permissions
  Manager: (perm) => !['users:delete', 'roles:delete', 'permissions:delete'].includes(perm.key),
  Accounting: (perm) => ['invoices', 'payments', 'carrier-payments', 'reports', 'dashboard'].includes(perm.module),
  Operations: (perm) =>
    ['carriers', 'vendors', 'customers', 'numbering', 'diagnostics', 'relationship-performance', 'dashboard'].includes(
      perm.module
    ),
  Viewer: (perm) => perm.action === 'read',
};

async function seed() {
  await connectDB();
  console.log('Connected. Seeding permissions...');

  const permissions = [];
  for (const mod of MODULES) {
    for (const action of ACTIONS) {
      const key = `${mod}:${action}`;
      const perm = await Permission.findOneAndUpdate(
        { key },
        { key, module: mod, action, description: `${action} ${mod}` },
        { upsert: true, new: true }
      );
      permissions.push(perm);
    }
  }
  console.log(`Seeded ${permissions.length} permissions.`);

  for (const [roleName, filterFn] of Object.entries(ROLE_DEFINITIONS)) {
    const rolePerms = permissions.filter((p) => filterFn(p) === true || filterFn(p) === undefined);
    const permIds = roleName === 'Admin' ? permissions.map((p) => p._id) : rolePerms.map((p) => p._id);
    await Role.findOneAndUpdate(
      { name: roleName },
      { name: roleName, permissions: permIds, isSystem: true, description: `${roleName} role` },
      { upsert: true, new: true }
    );
    console.log(`Seeded role: ${roleName} (${permIds.length} permissions)`);
  }

  const adminRole = await Role.findOne({ name: 'Admin' });
  const existingAdmin = await User.findOne({ email: 'admin@sirix.io' });
  if (!existingAdmin) {
    await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@sirix.io',
      password: 'Admin@12345',
      role: adminRole._id,
    });
    console.log('Created default admin user: admin@sirix.io / Admin@12345 (change this immediately)');
  } else {
    console.log('Admin user already exists, skipping.');
  }

  await disconnectDB();
  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
