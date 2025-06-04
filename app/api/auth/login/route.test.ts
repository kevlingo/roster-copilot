import { POST as loginRouteHandler } from './route'; // Assuming this is the main exported POST handler
import { NextRequest } from 'next/server';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as userDal from '@/lib/dal/user.dal';
import * as db from '@/lib/dal/db';
import { UserProfile } from '@/lib/models/user.models';

// More complete mock for next/server
// Self-contained mock for next/server
jest.mock('next/server', () => {
  class MockNextRequest {
    headers: Headers;
    nextUrl: URL;
    method: string;
    body?: any; // Store raw body for .json()
    ip?: string; // For rate limiter

    constructor(input: string | URL | RequestInfo, init?: RequestInit) {
      const url = typeof input === 'string' ? input : (input as URL).toString(); // Simplified
      this.nextUrl = new URL(url); // Use global URL
      this.headers = new Headers(init?.headers); // Use global Headers
      this.method = init?.method || 'GET';
      this.body = init?.body;
      this.ip = (init as any)?.ip || '127.0.0.1'; // Allow mocking IP
    }

    async json() {
      if (typeof this.body === 'string') {
        return Promise.resolve(JSON.parse(this.body));
      }
      return Promise.resolve(this.body || {});
    }
    // Add other NextRequest methods if needed by the handler (e.g., .text(), .formData())
  }

  return {
    NextResponse: {
      json: jest.fn((body, init) => ({
        status: init?.status || 200,
        headers: new Headers(init?.headers), // Use global Headers
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body)),
        body: body,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
      })),
    },
    NextRequest: MockNextRequest,
  };
});
// Mock bcrypt
jest.mock('bcrypt');
const mockedBcryptCompare = bcrypt.compare as jest.Mock;

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const mockedJwtSign = jwt.sign as jest.Mock;

// Mock DAL functions
let mockedFindUserByEmail: jest.Mock; // Declare without initializing
jest.mock('@/lib/dal/user.dal', () => ({
  findUserByEmail: (...args: any[]) => mockedFindUserByEmail(...args), // Use a wrapper
  // Add other functions from user.dal if they were to be used and need mocking
}));
mockedFindUserByEmail = jest.fn(); // Initialize after the mock setup

// Mock DB initialization
jest.mock('@/lib/dal/db');
const mockedInitializeDatabase = db.initializeDatabase as jest.Mock;

describe('POST /api/auth/login', () => {
  let mockRequest: NextRequest;
  const mockJwtSecret = 'test-secret';
  const mockJwtExpiresIn = '1h';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process.env
    process.env.JWT_SECRET = mockJwtSecret;
    process.env.JWT_EXPIRES_IN = mockJwtExpiresIn;

    mockedInitializeDatabase.mockResolvedValue(undefined); // Ensure DB init is mocked

    // Create mock request using the mocked NextRequest
    const rawRequest = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' })
    });
    mockRequest = rawRequest; // No need to cast if using new NextRequest directly

    // Explicitly mock the json method on the instance for specific test case control
    // The MockNextRequest has a default .json() method, but we override it per test as needed.
    (mockRequest as any).json = jest.fn().mockResolvedValue({ email: 'test@example.com', password: 'Password123!' });
    (mockRequest as any).ip = '127.0.0.1'; // for rate limiter
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });

  it('should return 405 if method is not POST', async () => {
    const getRequest = new NextRequest('http://localhost/api/auth/login', { method: 'GET' });
    (getRequest as any).ip = '127.0.0.1'; // Set IP for rate limiter if applicable
    // No need to mock .json() for GET if it's not called by the handler for GET
    const response = await loginRouteHandler(getRequest);
    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body).toEqual({ message: 'Method Not Allowed' });
  });

  it('should return 400 for invalid JSON body', async () => {
    // For this test, we need the .json() method on the specific mockRequest instance to throw an error
    (mockRequest as any).json = jest.fn().mockRejectedValueOnce(new Error('Invalid JSON'));
    const response = await loginRouteHandler(mockRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ message: 'Invalid JSON body' });
  });

  it('should return 400 for invalid DTO (missing email)', async () => {
    (mockRequest as any).json = jest.fn().mockResolvedValueOnce({ password: 'Password123!' });
    const response = await loginRouteHandler(mockRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors[0].property).toBe('email');
  });

  it('should return 401 if user not found', async () => {
    mockedFindUserByEmail.mockResolvedValue(null);
    const response = await loginRouteHandler(mockRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toContain('Invalid credentials');
  });

  it('should return 401 for invalid password', async () => {
    const mockUser: Partial<UserProfile> = {
      userId: '1',
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      emailVerified: true,
    };
    mockedFindUserByEmail.mockResolvedValue(mockUser);
    mockedBcryptCompare.mockResolvedValue(false); // Password mismatch

    const response = await loginRouteHandler(mockRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toContain('Invalid credentials');
  });

  it('should return 403 if email is not verified', async () => {
    const mockUser: Partial<UserProfile> = {
      userId: '1',
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      emailVerified: false, // Email not verified
    };
    mockedFindUserByEmail.mockResolvedValue(mockUser);
    mockedBcryptCompare.mockResolvedValue(true);

    const response = await loginRouteHandler(mockRequest);
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.message).toContain('Email not verified');
  });

  it('should return 500 if JWT_SECRET is not defined', async () => {
    delete process.env.JWT_SECRET;
    const mockUser: UserProfile = {
      userId: '1',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      emailVerified: true,
      selectedArchetype: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockedFindUserByEmail.mockResolvedValue(mockUser);
    mockedBcryptCompare.mockResolvedValue(true);

    const response = await loginRouteHandler(mockRequest);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toContain('Internal Server Error: JWT configuration missing');
  });

  it('should return 200 and token for successful login', async () => {
    const mockUser: UserProfile = {
      userId: '1',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      emailVerified: true,
      selectedArchetype: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const expectedToken = 'mocked.jwt.token';
    mockedFindUserByEmail.mockResolvedValue(mockUser);
    mockedBcryptCompare.mockResolvedValue(true);
    mockedJwtSign.mockReturnValue(expectedToken);

    const response = await loginRouteHandler(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Login successful');
    expect(body.token).toBe(expectedToken);
    expect(body.user.userId).toBe(mockUser.userId);
    expect(body.user.passwordHash).toBeUndefined(); // Ensure passwordHash is not returned
    expect(mockedJwtSign).toHaveBeenCalledWith(
      { userId: mockUser.userId, email: mockUser.email, username: mockUser.username },
      mockJwtSecret,
      { expiresIn: parseInt(mockJwtExpiresIn, 10) } // Align with how route parses it
    );
  });

   it('should use default JWT_EXPIRES_IN if env var is not set', async () => {
    delete process.env.JWT_EXPIRES_IN; // Remove env var to test default
     const mockUser: UserProfile = {
      userId: '1',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      emailVerified: true,
      selectedArchetype: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const expectedToken = 'mocked.jwt.token.default.expiry';
    mockedFindUserByEmail.mockResolvedValue(mockUser);
    mockedBcryptCompare.mockResolvedValue(true);
    mockedJwtSign.mockReturnValue(expectedToken);

    await loginRouteHandler(mockRequest);

    expect(mockedJwtSign).toHaveBeenCalledWith(
      { userId: mockUser.userId, email: mockUser.email, username: mockUser.username },
      mockJwtSecret,
      { expiresIn: 3600 } // Default 1 hour in seconds
    );
  });

  // TODO: Add test for rate limiting once it's fully integrated and mockable (e.g. by mocking req.ip)
});