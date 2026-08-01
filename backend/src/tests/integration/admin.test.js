const request = require('supertest');
const app = require('../../app');
const env = require('../../config/env');
const Role = require('../../models/Role');
const Permission = require('../../models/Permission');
const { seedAdminRole, seedViewerRole, createTestUser } = require('../helpers/seedTestData');

const base = env.apiPrefix;

async function loginAsAdmin() {
  const adminRole = await seedAdminRole();
  await createTestUser({ email: 'admin@example.com', password: 'Password123', role: adminRole });
  const res = await request(app)
    .post(`${base}/auth/login`)
    .send({ email: 'admin@example.com', password: 'Password123' });
  return res.body.data.accessToken;
}

describe('Admin endpoints', () => {
  describe('Users', () => {
    it('rejects requests without a token', async () => {
      const res = await request(app).get(`${base}/admin/users`);
      expect(res.status).toBe(401);
    });

    it('rejects a non-admin user without the required permission', async () => {
      const viewerRole = await seedViewerRole();
      await createTestUser({ email: 'viewer@example.com', password: 'Password123', role: viewerRole });
      const loginRes = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'viewer@example.com', password: 'Password123' });

      const res = await request(app)
        .get(`${base}/admin/users`)
        .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`);

      expect(res.status).toBe(403);
    });

    it('lists users for an admin', async () => {
      const token = await loginAsAdmin();
      const res = await request(app).get(`${base}/admin/users`).set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('creates a user with a valid roleId', async () => {
      const token = await loginAsAdmin();
      const viewerRole = await seedViewerRole();

      const res = await request(app)
        .post(`${base}/admin/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@example.com',
          password: 'Password123',
          roleId: viewerRole._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('newuser@example.com');
      expect(res.body.data.password).toBeUndefined();
    });

    it('rejects creating a user with an invalid roleId', async () => {
      const token = await loginAsAdmin();
      const res = await request(app)
        .post(`${base}/admin/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Bad',
          lastName: 'Role',
          email: 'badrole@example.com',
          password: 'Password123',
          roleId: '507f1f77bcf86cd799439011',
        });

      expect(res.status).toBe(400);
    });

    it('deactivates a user, which revokes their sessions', async () => {
      const token = await loginAsAdmin();
      const viewerRole = await seedViewerRole();
      const user = await createTestUser({ email: 'deactivate@example.com', password: 'Password123', role: viewerRole });

      const res = await request(app)
        .patch(`${base}/admin/users/${user._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);

      const loginAttempt = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'deactivate@example.com', password: 'Password123' });
      expect(loginAttempt.status).toBe(401);
    });

    it('soft-deletes a user', async () => {
      const token = await loginAsAdmin();
      const viewerRole = await seedViewerRole();
      const user = await createTestUser({ email: 'todelete@example.com', password: 'Password123', role: viewerRole });

      const res = await request(app)
        .delete(`${base}/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`${base}/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('Roles', () => {
    it('creates, updates, and prevents deletion of a role in use', async () => {
      const token = await loginAsAdmin();
      const perm = await Permission.create({ key: 'numbering:read', module: 'numbering', action: 'read' });

      const createRes = await request(app)
        .post(`${base}/admin/roles`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Custom Role', description: 'A custom role', permissions: [perm._id.toString()] });
      expect(createRes.status).toBe(201);
      const roleId = createRes.body.data._id;

      const updateRes = await request(app)
        .put(`${base}/admin/roles/${roleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Updated description' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.description).toBe('Updated description');

      const assignedRole = await Role.findById(roleId);
      await createTestUser({ email: 'hasrole@example.com', role: assignedRole });

      const deleteRes = await request(app)
        .delete(`${base}/admin/roles/${roleId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(409);
    });

    it('rejects duplicate role names', async () => {
      const token = await loginAsAdmin();
      await Role.create({ name: 'Duplicate', isSystem: false });

      const res = await request(app)
        .post(`${base}/admin/roles`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Duplicate' });

      expect(res.status).toBe(409);
    });

    it('prevents deleting a system role', async () => {
      const token = await loginAsAdmin();
      const systemRole = await Role.create({ name: 'System Role', isSystem: true });

      const res = await request(app)
        .delete(`${base}/admin/roles/${systemRole._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Permissions', () => {
    it('creates a permission and rejects a duplicate module/action pair', async () => {
      const token = await loginAsAdmin();

      const createRes = await request(app)
        .post(`${base}/admin/permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ module: 'invoices', action: 'export', description: 'Export invoices' });
      expect(createRes.status).toBe(201);
      expect(createRes.body.data.key).toBe('invoices:export');

      const dupRes = await request(app)
        .post(`${base}/admin/permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ module: 'invoices', action: 'export' });
      expect(dupRes.status).toBe(409);
    });

    it('prevents deleting a permission assigned to a role', async () => {
      const token = await loginAsAdmin();
      const perm = await Permission.create({ key: 'reports:export', module: 'reports', action: 'export' });
      await Role.create({ name: 'Reporter', permissions: [perm._id] });

      const res = await request(app)
        .delete(`${base}/admin/permissions/${perm._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(409);
    });
  });

  describe('Audit logs', () => {
    it('lists audit log entries generated by prior admin actions', async () => {
      const token = await loginAsAdmin();
      await request(app)
        .post(`${base}/admin/permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ module: 'carriers', action: 'export' });

      const res = await request(app)
        .get(`${base}/admin/audit-logs`)
        .set('Authorization', `Bearer ${token}`)
        .query({ module: 'ADMIN' });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Settings', () => {
    it('creates and fetches a setting by key', async () => {
      const token = await loginAsAdmin();

      const putRes = await request(app)
        .put(`${base}/admin/settings/general.company_name`)
        .set('Authorization', `Bearer ${token}`)
        .send({ value: 'Sirix Telecom', type: 'string', group: 'general' });
      expect(putRes.status).toBe(200);
      expect(putRes.body.data.value).toBe('Sirix Telecom');

      const getRes = await request(app)
        .get(`${base}/admin/settings/general.company_name`)
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.key).toBe('general.company_name');
    });

    it('returns 404 for an unknown setting key', async () => {
      const token = await loginAsAdmin();
      const res = await request(app)
        .get(`${base}/admin/settings/does.not.exist`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Sessions', () => {
    it('lists active sessions and can revoke one', async () => {
      const token = await loginAsAdmin();
      const viewerRole = await seedViewerRole();
      await createTestUser({ email: 'session@example.com', password: 'Password123', role: viewerRole });
      const loginRes = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'session@example.com', password: 'Password123' });

      const listRes = await request(app)
        .get(`${base}/admin/sessions`)
        .set('Authorization', `Bearer ${token}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThan(0);

      const session = listRes.body.data.find((s) => s.user?.email === 'session@example.com');
      expect(session).toBeDefined();

      const revokeRes = await request(app)
        .delete(`${base}/admin/sessions/${session._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(revokeRes.status).toBe(200);

      // The revoked refresh token can no longer be used
      const refreshRes = await request(app)
        .post(`${base}/auth/refresh`)
        .send({ refreshToken: loginRes.body.data.refreshToken });
      expect(refreshRes.status).toBe(401);
    });
  });
});
