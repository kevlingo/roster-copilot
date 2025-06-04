import { POST as loginHandler } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server'; // We still need the type
import { initializeDatabase, closeDb, connectDb } from '@/lib/dal/db';
import { createUserProfile, updateUserEmailVerificationStatus } from '@/lib/dal/user.dal';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

// More complete mock for next/server, same as in unit test
// Self-contained mock for next/server (same as in unit test)
jest.mock('next/server', () => {
  class MockNextRequest {
    headers: Headers;
    nextUrl: URL;
    method: string;
    body?: any;
    ip?: string;

    constructor(input: string | URL | RequestInfo, init?: RequestInit) {
      const url = typeof input === 'string' ? input : (input as URL).toString();
      this.nextUrl = new URL(url);
      this.headers = new Headers(init?.headers);
      this.method = init?.method || 'GET';
      this.body = init?.body;
      this.ip = (init as any)?.ip || '127.0.0.1';
    }

    async json() {
      if (typeof this.body === 'string') {
        return Promise.resolve(JSON.parse(this.body));
      }
      return Promise.resolve(this.body || {});
    }
  }

  return {
    NextResponse: {
      json: jest.fn((body, init) => ({
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body)),
        body: body,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
      })),
    },
    NextRequest: MockNextRequest,
  };
});
// Helper to create NextRequest objects for testing
const createTestRequest = (body: any) => {
  const request = new NextRequest('http://localhost/api/auth/login', { // Use mocked NextRequest
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return request; // No need to cast if using new NextRequest directly
};

const TEST_DB_DIR = path.resolve(process.cwd(), 'test/data');
const TEST_DB_PATH = path.join(TEST_DB_DIR, 'login-integration-test.db');


describe('POST /api/auth/login - Integration Tests', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const testJwtSecret = 'test-integration-secret';
  const testUserEmail = 'logintest@example.com';
  const testUserPassword = 'Password123!';
  let testUserPasswordHash = '';

  beforeAll(async () => {
    // Ensure test DB directory exists
    if (!fs.existsSync(TEST_DB_DIR)) {
      fs.mkdirSync(TEST_DB_DIR, { recursive: true });
    }
    // Set up a separate test database for these tests
    process.env.JWT_SECRET = testJwtSecret;
    await connectDb(TEST_DB_PATH); // Connect to the test DB
    await initializeDatabase(TEST_DB_PATH); // Initialize schema

    // Create a test user
    testUserPasswordHash = await bcrypt.hash(testUserPassword, 10);
    await createUserProfile({
      username: 'login_testuser',
      email: testUserEmail,
      passwordHash: testUserPasswordHash,
    });
  });

  afterAll(async () => {
    await closeDb();
    // Attempt to clean up the test database file
    try {
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
      }
      // Attempt to remove directory if empty, but don't fail if it's not
      if (fs.existsSync(TEST_DB_DIR) && fs.readdirSync(TEST_DB_DIR).length === 0) {
        fs.rmdirSync(TEST_DB_DIR);
      }
    } catch (err) {
      console.error('Error cleaning up test database:', err);
    }
    process.env.JWT_SECRET = originalJwtSecret; // Restore original secret
  });


  it('should fail with 401 for non-existent user', async () => {
    const req = createTestRequest({ email: 'nouser@example.com', password: 'somepassword' });
    const response = await loginHandler(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toContain('Invalid credentials');
  });

  it('should fail with 401 for existing user but wrong password', async () => {
    const req = createTestRequest({ email: testUserEmail, password: 'wrongPassword!' });
    const response = await loginHandler(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toContain('Invalid credentials');
  });

  it('should fail with 403 if user exists, password is correct, but email is not verified', async () => {
    // User created in beforeAll is not email verified by default
    const req = createTestRequest({ email: testUserEmail, password: testUserPassword });
    const response = await loginHandler(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toContain('Email not verified');
  });

  it('should succeed with 200 if credentials are valid and email is verified', async () => {
    // First, verify the user's email
    const userToVerify = await createUserProfile({
        username: 'verified_login_user',
        email: 'verifiedlogintest@example.com',
        passwordHash: await bcrypt.hash('VerifiedPass123!', 10),
    });
    await updateUserEmailVerificationStatus(userToVerify.userId, true);
    
    const req = createTestRequest({ email: 'verifiedlogintest@example.com', password: 'VerifiedPass123!' });
    const response = await loginHandler(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Login successful');
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe('verifiedlogintest@example.com');
    expect(body.user.passwordHash).toBeUndefined();
    expect(body.token).toBeDefined();

    // Verify token structure (optional, but good)
    const decodedToken: any = jwt.verify(body.token, testJwtSecret);
    expect(decodedToken.userId).toBe(userToVerify.userId);
    expect(decodedToken.email).toBe('verifiedlogintest@example.com');
  });

  it('should return 400 for invalid DTO (e.g. missing password)', async () => {
    const req = createTestRequest({ email: testUserEmail });
    const response = await loginHandler(req);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.errors).toBeInstanceOf(Array);
    expect(body.errors.some((err: any) => err.property === 'password')).toBe(true);
  });
});