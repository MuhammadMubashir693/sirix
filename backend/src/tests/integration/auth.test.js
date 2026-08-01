const request = require('supertest');
const app = require('../../app');
const env = require('../../config/env');
const { seedViewerRole, createTestUser } = require('../helpers/seedTestData');

const base = env.apiPrefix;

describe('Auth endpoints', () => {
  beforeEach(async () => {
    await seedViewerRole();
  });

  describe('POST /auth/register', () => {
    it('registers a new user with valid data', async () => {
      const res = await request(app).post(`${base}/auth/register`).send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('jane@example.com');
      expect(res.body.data.password).toBeUndefined();
    });

    it('rejects registration with a weak password', async () => {
      const res = await request(app).post(`${base}/auth/register`).send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane2@example.com',
        password: 'weak',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects duplicate email registration', async () => {
      await createTestUser({ email: 'dup@example.com' });

      const res = await request(app).post(`${base}/auth/register`).send({
        firstName: 'Dup',
        lastName: 'User',
        email: 'dup@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    it('logs in with correct credentials and returns tokens', async () => {
      await createTestUser({ email: 'login@example.com', password: 'Password123' });

      const res = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'login@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects login with incorrect password', async () => {
      await createTestUser({ email: 'login2@example.com', password: 'Password123' });

      const res = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'login2@example.com', password: 'incorrectPass123' });

      expect(res.status).toBe(401);
    });

    it('rejects login for nonexistent user', async () => {
      const res = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'nobody@example.com', password: 'Password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('rejects requests without a token', async () => {
      const res = await request(app).get(`${base}/auth/me`);
      expect(res.status).toBe(401);
    });

    it('returns the current user with a valid token', async () => {
      await createTestUser({ email: 'me@example.com', password: 'Password123' });
      const loginRes = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'me@example.com', password: 'Password123' });

      const res = await request(app)
        .get(`${base}/auth/me`)
        .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('me@example.com');
    });
  });

  describe('POST /auth/refresh', () => {
    it('rotates the refresh token and issues a new access token', async () => {
      await createTestUser({ email: 'refresh@example.com', password: 'Password123' });
      const loginRes = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'refresh@example.com', password: 'Password123' });

      const res = await request(app)
        .post(`${base}/auth/refresh`)
        .send({ refreshToken: loginRes.body.data.refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(loginRes.body.data.refreshToken);
    });

    it('rejects reuse of an already-rotated refresh token', async () => {
      await createTestUser({ email: 'reuse@example.com', password: 'Password123' });
      const loginRes = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'reuse@example.com', password: 'Password123' });

      const oldToken = loginRes.body.data.refreshToken;
      await request(app).post(`${base}/auth/refresh`).send({ refreshToken: oldToken });

      // Reusing the old (now revoked) token should fail
      const res = await request(app).post(`${base}/auth/refresh`).send({ refreshToken: oldToken });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/change-password', () => {
    it('changes password when current password is correct', async () => {
      await createTestUser({ email: 'change@example.com', password: 'Password123' });
      const loginRes = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'change@example.com', password: 'Password123' });

      const res = await request(app)
        .post(`${base}/auth/change-password`)
        .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`)
        .send({ currentPassword: 'Password123', newPassword: 'NewPassword123' });

      expect(res.status).toBe(200);

      const newLogin = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'change@example.com', password: 'NewPassword123' });
      expect(newLogin.status).toBe(200);
    });
  });

  describe('POST /auth/forgot-password + reset-password', () => {
    it('generates a reset token and allows resetting the password', async () => {
      await createTestUser({ email: 'forgot@example.com', password: 'Password123' });

      const forgotRes = await request(app).post(`${base}/auth/forgot-password`).send({ email: 'forgot@example.com' });
      expect(forgotRes.status).toBe(200);

      const resetUrl = forgotRes.body.data?.resetUrl;
      expect(resetUrl).toBeTruthy();
      const token = new URL(resetUrl).searchParams.get('token');

      const resetRes = await request(app)
        .post(`${base}/auth/reset-password`)
        .send({ token, newPassword: 'ResetPassword123' });
      expect(resetRes.status).toBe(200);

      const loginRes = await request(app)
        .post(`${base}/auth/login`)
        .send({ email: 'forgot@example.com', password: 'ResetPassword123' });
      expect(loginRes.status).toBe(200);
    });
  });
});
