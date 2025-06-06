/**
 * Chat DAL Integration Tests
 * Tests for chat history data access layer using real database
 */

import {
  saveChatMessage,
  getChatHistory,
  createConversationSession,
  getActiveConversationSessions,
  updateConversationSessionActivity,
  deactivateConversationSession,
} from './chat.dal';
import { initializeDatabase, closeDb, forceCloseDb } from './db';
import { createUserProfile, updateUserEmailVerificationStatus } from './user.dal';
import path from 'path';
import fs from 'fs';

// Use a test database file
const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test_chat_dal.db');

// Global variables for test user IDs
let testUserId: string;
let testUserId2: string;

// Setup test database
beforeAll(async () => {
  // Force close any existing connection
  forceCloseDb();

  // Remove test database if it exists
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  // Initialize test database
  await initializeDatabase(TEST_DB_PATH);

  // Create test users to satisfy foreign key constraints
  const user1 = await createUserProfile({
    username: 'testuser1',
    email: 'test1@example.com',
    passwordHash: 'hash123',
  });
  await updateUserEmailVerificationStatus(user1.userId, true);
  testUserId = user1.userId;

  const user2 = await createUserProfile({
    username: 'testuser2',
    email: 'test2@example.com',
    passwordHash: 'hash456',
  });
  await updateUserEmailVerificationStatus(user2.userId, true);
  testUserId2 = user2.userId;
});

// Cleanup after tests
afterAll(async () => {
  await closeDb();
  // Remove test database file
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

describe('Chat DAL', () => {

  describe('saveChatMessage', () => {
    it('should save a chat message successfully', async () => {
      const messageData = {
        userId: testUserId,
        content: 'Hello, this is a test message',
        role: 'user' as const,
        messageType: 'conversation' as const,
        timestamp: new Date(),
      };

      const savedMessage = await saveChatMessage(messageData);

      expect(savedMessage).toBeDefined();
      expect(savedMessage.messageId).toBeDefined();
      expect(savedMessage.userId).toBe(testUserId);
      expect(savedMessage.content).toBe(messageData.content);
      expect(savedMessage.role).toBe(messageData.role);
      expect(savedMessage.messageType).toBe(messageData.messageType);
      expect(savedMessage.createdAt).toBeDefined();
    });

    it('should save a message with component data', async () => {
      const messageData = {
        userId: testUserId,
        content: 'Choose your archetype',
        role: 'assistant' as const,
        messageType: 'component' as const,
        componentType: 'archetype-selection',
        componentProps: { options: ['eager', 'analytical'] },
        conversationContext: { phase: 'archetype-selection' },
        timestamp: new Date(),
      };

      const savedMessage = await saveChatMessage(messageData);

      expect(savedMessage.componentType).toBe(messageData.componentType);
      expect(savedMessage.componentProps).toEqual(messageData.componentProps);
      expect(savedMessage.conversationContext).toEqual(messageData.conversationContext);
    });
  });

  describe('getChatHistory', () => {
    beforeEach(async () => {
      // Create some test messages
      const messages = [
        {
          userId: testUserId,
          content: 'Message 1',
          role: 'user' as const,
          timestamp: new Date(Date.now() - 3000),
        },
        {
          userId: testUserId,
          content: 'Message 2',
          role: 'assistant' as const,
          timestamp: new Date(Date.now() - 2000),
        },
        {
          userId: testUserId,
          content: 'Message 3',
          role: 'user' as const,
          timestamp: new Date(Date.now() - 1000),
        },
        {
          userId: testUserId2,
          content: 'Other user message',
          role: 'user' as const,
          timestamp: new Date(),
        },
      ];

      for (const message of messages) {
        await saveChatMessage(message);
      }
    });

    it('should retrieve chat history for a user', async () => {
      const { messages, totalCount } = await getChatHistory(testUserId);

      expect(messages).toBeDefined();
      expect(messages.length).toBeGreaterThanOrEqual(3);
      expect(totalCount).toBeGreaterThanOrEqual(3);
      
      // Should only return messages for the specified user
      messages.forEach(message => {
        expect(message.userId).toBe(testUserId);
      });

      // Should be ordered by timestamp descending (newest first)
      for (let i = 1; i < messages.length; i++) {
        expect(messages[i-1].timestamp.getTime()).toBeGreaterThanOrEqual(messages[i].timestamp.getTime());
      }
    });

    it('should respect limit and offset parameters', async () => {
      const { messages: firstPage } = await getChatHistory(testUserId, { limit: 2, offset: 0 });
      const { messages: secondPage } = await getChatHistory(testUserId, { limit: 2, offset: 2 });

      expect(firstPage.length).toBeLessThanOrEqual(2);
      expect(secondPage.length).toBeLessThanOrEqual(2);

      // Should not have overlapping messages
      const firstPageIds = firstPage.map(m => m.messageId);
      const secondPageIds = secondPage.map(m => m.messageId);
      const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
      expect(overlap.length).toBe(0);
    });

    it('should filter by since date', async () => {
      const cutoffDate = new Date(Date.now() - 1500); // Between message 2 and 3
      const { messages } = await getChatHistory(testUserId, { since: cutoffDate });

      // Should only return messages newer than cutoff
      messages.forEach(message => {
        expect(message.timestamp.getTime()).toBeGreaterThan(cutoffDate.getTime());
      });
    });
  });

  describe('createConversationSession', () => {
    it('should create a conversation session successfully', async () => {
      const sessionData = {
        userId: testUserId,
        conversationType: 'onboarding' as const,
        startTime: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        isActive: true,
        deviceInfo: {
          userAgent: 'Test Agent',
          deviceType: 'desktop' as const,
        },
      };

      const savedSession = await createConversationSession(sessionData);

      expect(savedSession).toBeDefined();
      expect(savedSession.sessionId).toBeDefined();
      expect(savedSession.userId).toBe(testUserId);
      expect(savedSession.conversationType).toBe(sessionData.conversationType);
      expect(savedSession.isActive).toBe(true);
      expect(savedSession.deviceInfo).toEqual(sessionData.deviceInfo);
      expect(savedSession.createdAt).toBeDefined();
      expect(savedSession.updatedAt).toBeDefined();
    });
  });

  describe('getActiveConversationSessions', () => {
    beforeEach(async () => {
      // Create test sessions
      await createConversationSession({
        userId: testUserId,
        conversationType: 'onboarding',
        startTime: new Date(),
        lastActivity: new Date(),
        messageCount: 5,
        isActive: true,
      });

      await createConversationSession({
        userId: testUserId,
        conversationType: 'general',
        startTime: new Date(),
        lastActivity: new Date(),
        messageCount: 10,
        isActive: true,
      });

      await createConversationSession({
        userId: testUserId2,
        conversationType: 'general',
        startTime: new Date(),
        lastActivity: new Date(),
        messageCount: 3,
        isActive: true,
      });
    });

    it('should retrieve active sessions for a user', async () => {
      const sessions = await getActiveConversationSessions(testUserId);

      expect(sessions).toBeDefined();
      expect(sessions.length).toBeGreaterThanOrEqual(2);
      
      // Should only return sessions for the specified user
      sessions.forEach(session => {
        expect(session.userId).toBe(testUserId);
        expect(session.isActive).toBe(true);
      });
    });
  });

  describe('updateConversationSessionActivity', () => {
    it('should update session activity', async () => {
      const session = await createConversationSession({
        userId: testUserId,
        conversationType: 'general',
        startTime: new Date(),
        lastActivity: new Date(Date.now() - 5000),
        messageCount: 5,
        isActive: true,
      });

      const beforeUpdate = new Date();
      await updateConversationSessionActivity(session.sessionId, 10);

      const sessions = await getActiveConversationSessions(testUserId);
      const updatedSession = sessions.find(s => s.sessionId === session.sessionId);

      expect(updatedSession).toBeDefined();
      expect(updatedSession!.messageCount).toBe(10);
      expect(updatedSession!.lastActivity.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('deactivateConversationSession', () => {
    it('should deactivate a session', async () => {
      const session = await createConversationSession({
        userId: testUserId,
        conversationType: 'general',
        startTime: new Date(),
        lastActivity: new Date(),
        messageCount: 5,
        isActive: true,
      });

      await deactivateConversationSession(session.sessionId);

      const activeSessions = await getActiveConversationSessions(testUserId);
      const deactivatedSession = activeSessions.find(s => s.sessionId === session.sessionId);

      expect(deactivatedSession).toBeUndefined();
    });
  });
});
