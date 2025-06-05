const request = require('supertest');
const bcrypt = require('bcrypt');

/**
 * Authentication Tests
 * Tests for admin login with new credentials
 */
describe('Authentication', () => {
  let app;

  beforeAll(async () => {
    // Initialize app
    app = require('../src/app');
  });

  describe('POST /api/login', () => {
    test('should login with valid credentials go@osama.agency / sfera13', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'go@osama.agency',
          password: 'sfera13'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'go@osama.agency');
      expect(response.body).toHaveProperty('name', 'Root Admin');
      expect(response.body).toHaveProperty('role', 'admin');
      expect(response.body).not.toHaveProperty('password_hash');
    });

    test('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'go@osama.agency',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message[0]).toBe('Email or Password is invalid');
    });

    test('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@email.com',
          password: 'sfera13'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message[0]).toBe('Email or Password is invalid');
    });

    test('should reject old admin credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'admin@sneat.com',
          password: 'admin'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message[0]).toBe('Email or Password is invalid');
    });
  });

  describe('Password hashing', () => {
    test('should correctly hash and verify password sfera13', async () => {
      const password = 'sfera13';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hash);

      expect(isValid).toBe(true);
    });
  });
});
