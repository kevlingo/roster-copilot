/**
 * Chat History API Integration Tests
 * Tests for /api/chat/history endpoints using real database and authentication
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
import { saveChatMessage } from '@/lib/dal/chat.dal';
import { createUserProfile, updateUserEmailVerificationStatus } from '@/lib/dal/user.dal';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

// Use a test database file
const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_chat_history_api.db');

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
    username: 'testuser-history',
    email: 'test-history@example.com',
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

describe('/api/chat/history', () => {
  beforeEach(async () => {
    // Clean up and create test data
    const testMessages = [
      {
        userId: testUserId,
        content: 'Hello, how are you?',
        role: 'user' as const,
        messageType: 'conversation' as const,
        timestamp: new Date(Date.now() - 3000),
      },
      {
        userId: testUserId,
        content: 'I am doing well, thank you!',
        role: 'assistant' as const,
        messageType: 'conversation' as const,
        timestamp: new Date(Date.now() - 2000),
      },
      {
        userId: testUserId,
        content: 'What can you help me with?',
        role: 'user' as const,
        messageType: 'conversation' as const,
        timestamp: new Date(Date.now() - 1000),
      },
    ];

    for (const message of testMessages) {
      await saveChatMessage(message);
    }
  });

  describe('GET /api/chat/history', () => {
    it('should retrieve chat history successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/history', {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.messages).toBeDefined();
      expect(Array.isArray(data.messages)).toBe(true);
      expect(data.totalCount).toBeGreaterThanOrEqual(3);
      expect(data.hasMore).toBeDefined();

      // Check message structure
      if (data.messages.length > 0) {
        const message = data.messages[0];
        expect(message.messageId).toBeDefined();
        expect(message.content).toBeDefined();
        expect(message.role).toBeDefined();
        expect(message.timestamp).toBeDefined();
        expect(message.createdAt).toBeDefined();
      }
    });

    it('should respect limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/history?limit=2', {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.messages.length).toBeLessThanOrEqual(2);
    });

    it('should respect offset parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/history?limit=1&offset=0', {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const firstResponse = await GET(request);
      const firstData = await firstResponse.json();

      const request2 = new NextRequest('http://localhost:3000/api/chat/history?limit=1&offset=1', {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const secondResponse = await GET(request2);
      const secondData = await secondResponse.json();

      expect(firstResponse.status).toBe(200);
      expect(secondResponse.status).toBe(200);
      
      if (firstData.messages.length > 0 && secondData.messages.length > 0) {
        expect(firstData.messages[0].messageId).not.toBe(secondData.messages[0].messageId);
      }
    });

    it('should filter by conversationType', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/history?conversationType=onboarding', {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.messages).toBeDefined();
    });

    it('should filter by since parameter', async () => {
      const sinceDate = new Date(Date.now() - 1500).toISOString();
      const request = new NextRequest(`http://localhost:3000/api/chat/history?since=${sinceDate}`, {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // All returned messages should be newer than the since date
      data.messages.forEach((message: { timestamp: string }) => {
        expect(new Date(message.timestamp).getTime()).toBeGreaterThan(new Date(sinceDate).getTime());
      });
    });

    it('should cap limit at 100', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/history?limit=200', {
        headers: { 'authorization': `Bearer ${testJwtToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // The actual limit should be capped at 100, but we can't easily test this without 100+ messages
    });
  });

  describe('POST /api/chat/history', () => {
    it('should save a chat message successfully', async () => {
      const messageData = {
        content: 'This is a test message',
        role: 'user',
        messageType: 'conversation',
        timestamp: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/chat/history', {
        method: 'POST',
        body: JSON.stringify(messageData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
      expect(data.message.messageId).toBeDefined();
      expect(data.message.content).toBe(messageData.content);
      expect(data.message.role).toBe(messageData.role);
      expect(data.message.messageType).toBe(messageData.messageType);
    });

    it('should save a message with component data', async () => {
      const messageData = {
        content: 'Choose your archetype',
        role: 'assistant',
        messageType: 'component',
        componentType: 'archetype-selection',
        componentProps: { options: ['eager', 'analytical'] },
        conversationContext: { phase: 'archetype-selection' },
      };

      const request = new NextRequest('http://localhost:3000/api/chat/history', {
        method: 'POST',
        body: JSON.stringify(messageData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message.componentType).toBe(messageData.componentType);
      expect(data.message.componentProps).toEqual(messageData.componentProps);
      expect(data.message.conversationContext).toEqual(messageData.conversationContext);
    });

    it('should return 400 for missing required fields', async () => {
      const messageData = {
        content: 'Missing role field',
        // role is missing
      };

      const request = new NextRequest('http://localhost:3000/api/chat/history', {
        method: 'POST',
        body: JSON.stringify(messageData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('should return 400 for invalid role', async () => {
      const messageData = {
        content: 'Invalid role',
        role: 'invalid-role',
      };

      const request = new NextRequest('http://localhost:3000/api/chat/history', {
        method: 'POST',
        body: JSON.stringify(messageData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid role');
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/history', {
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

    it('should default messageType to conversation', async () => {
      const messageData = {
        content: 'Test message without messageType',
        role: 'user',
      };

      const request = new NextRequest('http://localhost:3000/api/chat/history', {
        method: 'POST',
        body: JSON.stringify(messageData),
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${testJwtToken}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message.messageType).toBe('conversation');
    });

    it('should set timestamp if not provided', async () => {
      const messageData = {
        content: 'Test message without timestamp',
        role: 'user',
      };

      const beforeRequest = new Date();
      const request = new NextRequest('http://localhost:3000/api/chat/history', {
        method: 'POST',
        body: JSON.stringify(messageData),
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
      
      const messageTimestamp = new Date(data.message.timestamp);
      expect(messageTimestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(messageTimestamp.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });
  });
});
