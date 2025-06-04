/**
 * @jest-environment node
 */
import { NextApiRequest, NextApiResponse } from 'next'; // For mocking req/res if needed
import { describe, it, expect, jest, beforeAll, afterAll, afterEach } from '@jest/globals';
// import { Resend } from 'resend'; // No longer mocking Resend directly here
import sqlite3 from 'sqlite3'; // Using sqlite3 directly, consistent with app
import path from 'path';
import fs from 'fs/promises';
import { NextRequest as NextRequestTypeDefinition } from 'next/server'; // Import for type

// Functions from our app
import * as userDal from '@/lib/dal/user.dal';
import { initializeDatabase, connectDb, closeDb, run as dbRun, all as dbAll } from '@/lib/dal/db';
import { notificationService } from '@/lib/services/NotificationService'; // Import the service instance

// Path to the TEST SQLite database file
const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'roster_copilot_test.db');

// Mocks for NextRequest
const mockNextRequest = (method: string, body?: any, urlPath?: string, headers?: HeadersInit) => {
  const url = new URL(urlPath || '/', 'http://localhost:3000');
  const request = new Request(url.toString(), {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  });
  (request as any).nextUrl = url; // Simulate Next.js specific property
  (request as any).ip = '127.0.0.1'; // Simulate Next.js specific property
  return request as unknown as import('next/server').NextRequest;
};

// mockJsonResponse should return something that behaves like a Response
const mockJsonResponse = jest.fn((body: any, init?: ResponseInit): Response => {
    const responseBody = body === undefined ? null : JSON.stringify(body);
    const response = new Response(responseBody, init);
    // Ensure .json() method exists and behaves as expected for a standard Response
    if (typeof (response as any).json !== 'function') {
        (response as any).json = async () => JSON.parse(await response.text());
    }
    return response;
});

// mockRedirectResponse should also return something Response-like
const mockRedirectResponse = jest.fn((url: string | URL, init?: ResponseInit): Response => {
    const status = init?.status || 302;
    const headers = new Headers(init?.headers);
    headers.set('Location', url.toString()); // Redirects need a Location header
    
    return new Response(null, { // Body is typically null for redirects.
        status,
        headers,
        ...init
    });
});

jest.mock('next/server', () => {
  const NextRequestOriginal = (jest.requireActual('next/server') as { NextRequest: typeof NextRequestTypeDefinition }).NextRequest;
  return {
    NextResponse: {
      json: mockJsonResponse,
      redirect: mockRedirectResponse,
    },
    NextRequest: jest.fn((...args: any[]) => {
      if (args.length === 1 && (typeof args[0] === 'string' || args[0] instanceof URL)) {
        const req = new NextRequestOriginal(args[0]);
        (req as any).nextUrl = new URL(args[0].toString(), 'http://localhost');
        (req as any).ip = '127.0.0.1';
        return req;
      } else if (args.length === 2 && (typeof args[0] === 'string' || args[0] instanceof URL) && typeof args[1] === 'object') {
        const req = new NextRequestOriginal(args[0], args[1]);
        (req as any).nextUrl = new URL(args[0].toString(), 'http://localhost');
        (req as any).ip = '127.0.0.1';
        return req;
      }
      console.warn('[Test Mock] NextRequest called with unexpected arguments:', args);
      return {
        nextUrl: new URL('http://localhost/'),
        headers: new Headers(),
        ip: '127.0.0.1',
        json: async (): Promise<any> => ({}),
        text: async (): Promise<string> => "",
      };
    }),
  };
});

// Define a type for our route handlers
type TestApiHandler = (
  req: import('next/server').NextRequest,
  context?: { params?: { [key: string]: string | string[] | undefined } }
) => Promise<Response>; // Route handlers in Next.js App Router return Promise<Response>

// Declare route handlers, will be assigned in beforeAll
let signupRouteHandler: TestApiHandler;
let verifyEmailRouteHandler: TestApiHandler;

describe('Auth API Integration Tests', () => {
  let mockSendVerificationEmail: jest.SpiedFunction<typeof notificationService.sendVerificationEmail>;

  beforeAll(async () => {
    // Ensure test DB directory exists and old DB is removed
    await fs.mkdir(path.dirname(TEST_DB_PATH), { recursive: true });
    try { await fs.unlink(TEST_DB_PATH); } catch (e) { /* ignore if not found */ }
      
    // Initialize the schema on the test database. This will also connect.
    await initializeDatabase(TEST_DB_PATH);

    // Dynamically import route handlers AFTER DB is initialized
    const signupModule = await import('@/app/api/auth/signup/route');
    signupRouteHandler = signupModule.POST as TestApiHandler;
    const verifyEmailModule = await import('@/app/api/auth/verify-email/[token]/route');
    verifyEmailRouteHandler = verifyEmailModule.GET as TestApiHandler;
  });

  beforeEach(() => {
    // Spy on and mock the implementation of sendVerificationEmail for each test
    mockSendVerificationEmail = jest.spyOn(notificationService, 'sendVerificationEmail')
      .mockResolvedValue(true); // Assume email sends successfully by default
  });

  afterEach(async () => {
    // Clear data from tables, but keep the connection open
    await dbRun('DELETE FROM EmailVerificationTokens_PoC;');
    await dbRun('DELETE FROM UserProfiles;');
    mockSendVerificationEmail.mockRestore(); // Restore the original implementation
    mockJsonResponse.mockClear();
    mockRedirectResponse.mockClear();
  });

  afterAll(async () => {
    // Close the database connection
    await closeDb();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user, generate a token, and send a verification email', async () => {
      // mockResendSend.mockResolvedValue({ data: { id: 'resend-email-id' }, error: null }); // No longer using this global mock for this test
      
      const signupData = {
        username: 'integTestUser',
        email: 'integ@example.com',
        password: 'Password123!',
        passwordConfirmation: 'Password123!',
      };
      const req = mockNextRequest('POST', signupData, '/api/auth/signup');
      const response = await signupRouteHandler(req); // Returns Promise<Response>
      const body = await response.json(); // Standard Response.json()

      expect(response.status).toBe(201);
      expect(body.message).toContain('User registered successfully');

      const dbUser = await userDal.findUserByEmail(signupData.email);
      expect(dbUser).toBeDefined();
      expect(dbUser?.username).toBe(signupData.username);
      expect(dbUser?.emailVerified).toBe(false);

      // Use dbAll from db.ts
      const tokens = await dbAll('SELECT * FROM EmailVerificationTokens_PoC WHERE userId = ?', [dbUser?.userId]) as any[];
      expect(tokens.length).toBe(1);
      expect(tokens[0].email).toBe(signupData.email);

      expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mockSendVerificationEmail).toHaveBeenCalledWith(
        signupData.email,
        signupData.username,
        tokens[0].token
      );
    });

    it('should return 409 if username is taken', async () => {
      await userDal.createUserProfile({ username: 'existingUser', email: 'unique@example.com', passwordHash: 'hash' });
      
      const signupData = {
        username: 'existingUser',
        email: 'new@example.com',
        password: 'Password123!',
        passwordConfirmation: 'Password123!',
      };
      const req = mockNextRequest('POST', signupData);
      const response = await signupRouteHandler(req);
      const body = await response.json();
      
      expect(response.status).toBe(409);
      expect(body.errors[0].message).toBe('Username already taken');
    });

     it('should return 400 for invalid input (e.g. password mismatch)', async () => {
        const signupData = {
            username: 'testUser',
            email: 'test@example.com',
            password: 'Password123!',
            passwordConfirmation: 'WrongPassword123!',
        };
        const req = mockNextRequest('POST', signupData);
        const response = await signupRouteHandler(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.errors[0].message).toBe('Passwords do not match');
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    it('should verify email, mark token as used, and redirect to login on valid token', async () => {
      const user = await userDal.createUserProfile({ username: 'verifyUser', email: 'verify@example.com', passwordHash: 'hash' });
      const tokenValue = 'valid-verification-token-123';
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await userDal.createEmailVerificationToken({ userId: user.userId, token: tokenValue, email: user.email, expiresAt });

      const req = mockNextRequest('GET', undefined, `/api/auth/verify-email/${tokenValue}`);
      const response = await verifyEmailRouteHandler(req, { params: { token: tokenValue } });
      
      expect(response.status).toBe(302);
      const locationHeader = response.headers.get('Location');
      expect(locationHeader).toBeDefined();
      const redirectUrl = new URL(locationHeader!); 
      expect(redirectUrl.pathname).toBe('/login');
      expect(redirectUrl.searchParams.get('verified')).toBe('true');
      expect(redirectUrl.searchParams.get('email')).toBe(user.email);

      const updatedUser = await userDal.findUserByEmail(user.email);
      expect(updatedUser?.emailVerified).toBe(true);

      const usedToken = await userDal.findVerificationToken(tokenValue);
      expect(usedToken?.used).toBe(true);
    });

    it('should return 400 if token is invalid or not found', async () => {
      const req = mockNextRequest('GET', undefined, '/api/auth/verify-email/invalid-token');
      const response = await verifyEmailRouteHandler(req, { params: { token: 'invalid-token' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid or expired verification link.');
    });

    it('should return 400 if token is expired', async () => {
        const user = await userDal.createUserProfile({ username: 'expUser', email: 'exp@example.com', passwordHash: 'hash' });
        const tokenValue = 'expired-token-456';
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        await userDal.createEmailVerificationToken({ userId: user.userId, token: tokenValue, email: user.email, expiresAt: pastDate });
  
        const req = mockNextRequest('GET', undefined, `/api/auth/verify-email/${tokenValue}`);
        const response = await verifyEmailRouteHandler(req, { params: { token: tokenValue } });
        const body = await response.json();
        
        expect(response.status).toBe(400);
        expect(body.error).toBe('Verification link has expired.');
      });

      it('should return 400 if token has already been used', async () => {
        const user = await userDal.createUserProfile({ username: 'usedTokenUser', email: 'used@example.com', passwordHash: 'hash' });
        const tokenValue = 'already-used-token-789';
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await userDal.createEmailVerificationToken({ userId: user.userId, token: tokenValue, email: user.email, expiresAt });
        await userDal.markTokenAsUsed(tokenValue);
  
        const req = mockNextRequest('GET', undefined, `/api/auth/verify-email/${tokenValue}`);
        const response = await verifyEmailRouteHandler(req, { params: { token: tokenValue } });
        const body = await response.json();
        
        expect(response.status).toBe(400);
        expect(body.error).toBe('Verification link has already been used.');
      });
  });
});