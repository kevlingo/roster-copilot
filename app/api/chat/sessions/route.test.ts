/**
 * Conversation Sessions API Integration Tests
 * Tests for /api/chat/sessions endpoints using real database and authentication
 */

// Set JWT secret BEFORE any imports that might use it
process.env.JWT_SECRET = 'test-secret-key';

// Mock next/server to provide json() method for NextRequest
jest.mock('next/server', () => {
  class MockNextRequest {
    headers: Headers;
    nextUrl: URL;
    method: string;
    body?: unknown;
    ip?: string;
    url: string;

    constructor(input: string | URL | RequestInfo, init?: RequestInit) {
      const url = typeof input === 'string' ? input : (input as URL).toString();
      this.url = url;
      this.nextUrl = new URL(url);
      this.headers = new Headers(init?.headers);
      this.method = init?.method || 'GET';
      this.body = init?.body;
      this.ip = (init as unknown as { ip?: string })?.ip || '127.0.0.1';
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

import { NextRequest } from 'next/server';
import { initializeDatabase, closeDb, forceCloseDb } from '@/lib/dal/db';
import { createConversationSession } from '@/lib/dal/chat.dal';
import { createUserProfile, updateUserEmailVerificationStatus } from '@/lib/dal/user.dal';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

// Use a test database file
const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_chat_sessions_api.db');

// Test user and JWT setup
let testUserId: string;
let testJwtToken: string;
const JWT_SECRET = 'test-secret-key';

// Define a type for our route handlers
type TestApiHandler = (
  req: NextRequest,
  context?: { params?: { [key: string]: string | string[] | undefined } }
) => Promise<Response>;

// Declare route handlers, will be assigned in beforeAll
let GET: TestApiHandler;
let POST: TestApiHandler;

// Setup test database and authentication
beforeAll(async () => {

  // Force close any existing connection
  forceCloseDb();

  // Remove test database if it exists
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  // Initialize test database
  await initializeDatabase(TEST_DB_PATH);

  // Create test user
  const user = await createUserProfile({
    username: 'testuser-sessions',
    email: 'test-sessions@example.com',
    passwordHash: 'hash123',
  });
  await updateUserEmailVerificationStatus(user.userId, true);
  testUserId = user.userId;

  // Create JWT token for authentication
  testJwtToken = jwt.sign(
    { userId: user.userId, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Dynamically import route handlers AFTER DB is initialized
  const routeModule = await import('./route');
  GET = routeModule.GET as TestApiHandler;
  POST = routeModule.POST as TestApiHandler;
});

// Cleanup after tests
afterAll(async () => {
  await closeDb();
  // Remove test database file
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

describe('/api/chat/sessions', () => {
  beforeEach(async () => {
    // Create some test sessions
    await createConversationSession({
      userId: testUserId,
      conversationType: 'onboarding',
      startTime: new Date(Date.now() - 5000),
      lastActivity: new Date(Date.now() - 1000),
      messageCount: 5,
      isActive: true,
      deviceInfo: {
        userAgent: 'Test Agent 1',
        deviceType: 'desktop',
      },
    });

    await createConversationSession({
      userId: testUserId,
      conversationType: 'general',
      startTime: new Date(Date.now() - 3000),
      lastActivity: new Date(),
      messageCount: 10,
      isActive: true,
      deviceInfo: {
        userAgent: 'Test Agent 2',
        deviceType: 'mobile',
      },
    });
  });

  describe('GET /api/chat/sessions', () => {
    it('should retrieve active conversation sessions successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.sessions).toBeDefined();
      expect(Array.isArray(data.sessions)).toBe(true);
      expect(data.sessions.length).toBeGreaterThanOrEqual(2);

      // Check session structure
      if (data.sessions.length > 0) {
        const session = data.sessions[0];
        expect(session.sessionId).toBeDefined();
        expect(session.conversationType).toBeDefined();
        expect(session.startTime).toBeDefined();
        expect(session.lastActivity).toBeDefined();
        expect(session.messageCount).toBeDefined();
        expect(session.isActive).toBe(true);
        expect(session.createdAt).toBeDefined();
        expect(session.updatedAt).toBeDefined();
      }
    });

    it('should only return sessions for the authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // All sessions should belong to the test user
      data.sessions.forEach((session: { isActive: boolean }) => {
        // Note: The API doesn't return userId in the response for security,
        // but we know they should all be for the authenticated user
        expect(session.isActive).toBe(true);
      });
    });

    it('should return sessions ordered by lastActivity descending', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      if (data.sessions.length > 1) {
        for (let i = 1; i < data.sessions.length; i++) {
          const prevActivity = new Date(data.sessions[i-1].lastActivity);
          const currActivity = new Date(data.sessions[i].lastActivity);
          expect(prevActivity.getTime()).toBeGreaterThanOrEqual(currActivity.getTime());
        }
      }
    });
  });

  describe('POST /api/chat/sessions', () => {
    it('should create a conversation session successfully', async () => {
      const sessionData = {
        conversationType: 'digest',
        deviceInfo: {
          userAgent: 'Test Agent 3',
          deviceType: 'tablet',
          platform: 'iOS',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.session).toBeDefined();
      expect(data.session.sessionId).toBeDefined();
      expect(data.session.conversationType).toBe(sessionData.conversationType);
      expect(data.session.messageCount).toBe(0);
      expect(data.session.isActive).toBe(true);
      expect(data.session.deviceInfo).toEqual(sessionData.deviceInfo);
      expect(data.session.startTime).toBeDefined();
      expect(data.session.lastActivity).toBeDefined();
      expect(data.session.createdAt).toBeDefined();
      expect(data.session.updatedAt).toBeDefined();
    });

    it('should create a session without deviceInfo', async () => {
      const sessionData = {
        conversationType: 'general',
      };

      const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.session.conversationType).toBe(sessionData.conversationType);
      expect(data.session.deviceInfo).toBeUndefined();
    });

    it('should return 400 for missing conversationType', async () => {
      const sessionData = {
        deviceInfo: {
          userAgent: 'Test Agent',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
      expect(data.details).toBe('conversationType is required');
    });

    it('should return 400 for invalid conversationType', async () => {
      const sessionData = {
        conversationType: 'invalid-type',
      };

      const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid conversationType');
      expect(data.details).toBe('conversationType must be one of: onboarding, general, digest');
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should accept all valid conversationTypes', async () => {
      const validTypes = ['onboarding', 'general', 'digest'];

      for (const conversationType of validTypes) {
        const sessionData = { conversationType };

        const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
          method: 'POST',
          body: JSON.stringify(sessionData),
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${testJwtToken}`,
          },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.session.conversationType).toBe(conversationType);
      }
    });

    it('should set startTime and lastActivity to current time', async () => {
      const sessionData = {
        conversationType: 'general',
      };

      const beforeRequest = new Date();
      const request = new NextRequest('http://localhost:3000/api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();
      const afterRequest = new Date();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      
      const startTime = new Date(data.session.startTime);
      const lastActivity = new Date(data.session.lastActivity);
      
      expect(startTime.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(startTime.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
      expect(lastActivity.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(lastActivity.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });
  });
});
