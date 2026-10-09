const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { setupTestDB } = require('./setup');

setupTestDB();

describe('Authentication & Authorization API Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await User.create({
      name: 'Test Student',
      email: 'student.test@example.com',
      password: 'Password123',
      role: 'student',
      status: 'active',
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully log in with valid credentials and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student.test@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('student.test@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should fail to log in with an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student.test@example.com',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should fail to log in with a non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Routes & Authorization', () => {
    it('should reject requests without a Bearer token with 401', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no authentication token/i);
    });

    it('should reject requests with an invalid Bearer token with 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_garbage_token_123');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should enforce role-based access restrictions (403 for student accessing admin endpoints)', async () => {
      // Login as student
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student.test@example.com',
          password: 'Password123',
        });

      const token = loginRes.body.data.token;

      // Student tries to access admin-only endpoint
      const adminRes = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${token}`);

      expect(adminRes.status).toBe(403);
      expect(adminRes.body.success).toBe(false);
      expect(adminRes.body.message).toMatch(/not authorized/i);
    });
  });
});
