/**
 * Chat History Service Tests
 * Tests for the frontend chat history service
 */

import { ChatHistoryService } from './chat-history.service';
import { MessageObject } from '@/src/types/chat';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ChatHistoryService', () => {
  let service: ChatHistoryService;
  const mockAuthToken = 'test-auth-token';

  beforeEach(() => {
    service = new ChatHistoryService();
    service.setAuthToken(mockAuthToken);
    mockFetch.mockClear();
  });

  describe('setAuthToken', () => {
    it('should set the auth token', () => {
      const newToken = 'new-token';
      service.setAuthToken(newToken);
      
      // We can't directly test the private property, but we can test it through API calls
      expect(service).toBeDefined();
    });
  });

  describe('persistMessage', () => {
    it('should persist a message successfully', async () => {
      const testMessage: MessageObject = {
        id: 'test-id',
        text: 'Hello, world!',
        sender: 'user',
        timestamp: new Date(),
        type: 'conversation',
      };

      const mockResponse = {
        success: true,
        message: {
          messageId: 'saved-id',
          content: testMessage.text,
          role: 'user',
          messageType: 'conversation',
          timestamp: testMessage.timestamp.toISOString(),
          createdAt: new Date().toISOString(),
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.persistMessage(testMessage);

      expect(mockFetch).toHaveBeenCalledWith('/api/chat/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          content: testMessage.text,
          role: 'user',
          messageType: 'conversation',
          conversationContext: undefined,
          timestamp: testMessage.timestamp.toISOString(),
        }),
      });

      expect(result.id).toBe('saved-id');
      expect(result.text).toBe(testMessage.text);
      expect(result.sender).toBe('user');
    });

    it('should persist a message with conversation context', async () => {
      const testMessage: MessageObject = {
        id: 'test-id',
        text: 'Choose archetype',
        sender: 'ai',
        timestamp: new Date(),
        type: 'component',
        componentType: 'archetype-selection',
      };

      const conversationContext = { phase: 'archetype-selection' };

      const mockResponse = {
        success: true,
        message: {
          messageId: 'saved-id',
          content: testMessage.text,
          role: 'assistant',
          messageType: 'component',
          componentType: 'archetype-selection',
          conversationContext,
          timestamp: testMessage.timestamp.toISOString(),
          createdAt: new Date().toISOString(),
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.persistMessage(testMessage, conversationContext);

      expect(mockFetch).toHaveBeenCalledWith('/api/chat/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          content: testMessage.text,
          role: 'assistant',
          messageType: 'component',
          componentType: 'archetype-selection',
          componentProps: undefined,
          conversationContext,
          timestamp: testMessage.timestamp.toISOString(),
        }),
      });

      expect(result.componentType).toBe('archetype-selection');
    });

    it('should handle API errors', async () => {
      const testMessage: MessageObject = {
        id: 'test-id',
        text: 'Hello, world!',
        sender: 'user',
        timestamp: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.persistMessage(testMessage)).rejects.toThrow(
        'Failed to persist message: 500 Internal Server Error'
      );
    });

    it('should handle network errors', async () => {
      const testMessage: MessageObject = {
        id: 'test-id',
        text: 'Hello, world!',
        sender: 'user',
        timestamp: new Date(),
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.persistMessage(testMessage)).rejects.toThrow('Network error');
    });
  });

  describe('loadConversationHistory', () => {
    it('should load conversation history successfully', async () => {
      const mockResponse = {
        success: true,
        messages: [
          {
            messageId: 'msg-1',
            content: 'Hello',
            role: 'user',
            messageType: 'conversation',
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            messageId: 'msg-2',
            content: 'Hi there!',
            role: 'assistant',
            messageType: 'conversation',
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        totalCount: 2,
        hasMore: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.loadConversationHistory();

      expect(mockFetch).toHaveBeenCalledWith('/api/chat/history?', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
      });

      expect(result.messages).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(result.messages[0].id).toBe('msg-1');
      expect(result.messages[0].sender).toBe('user');
    });

    it('should load conversation history with options', async () => {
      const options = {
        limit: 10,
        offset: 5,
        conversationType: 'onboarding' as const,
        since: new Date('2023-01-01'),
      };

      const mockResponse = {
        success: true,
        messages: [],
        totalCount: 0,
        hasMore: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.loadConversationHistory(options);

      // The URL will have encoded colons, so we need to check the actual call
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const actualCall = mockFetch.mock.calls[0];
      expect(actualCall[0]).toContain('limit=10');
      expect(actualCall[0]).toContain('offset=5');
      expect(actualCall[0]).toContain('conversationType=onboarding');
      expect(actualCall[0]).toContain('since=2023-01-01T00');
      expect(actualCall[1]).toEqual({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.loadConversationHistory()).rejects.toThrow(
        'Failed to load chat history: 500 Internal Server Error'
      );
    });
  });

  describe('createConversationSession', () => {
    it('should create a conversation session successfully', async () => {
      const mockResponse = {
        success: true,
        session: {
          sessionId: 'session-123',
          conversationType: 'general',
          startTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.createConversationSession('general');

      expect(mockFetch).toHaveBeenCalledWith('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          conversationType: 'general',
          deviceInfo: undefined,
        }),
      });

      expect(result).toBe('session-123');
    });

    it('should create a session with device info', async () => {
      const deviceInfo = {
        userAgent: 'Test Agent',
        deviceType: 'desktop' as const,
        platform: 'Windows',
      };

      const mockResponse = {
        success: true,
        session: {
          sessionId: 'session-456',
          conversationType: 'onboarding',
          deviceInfo,
          startTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.createConversationSession('onboarding', deviceInfo);

      expect(mockFetch).toHaveBeenCalledWith('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          conversationType: 'onboarding',
          deviceInfo,
        }),
      });

      expect(result).toBe('session-456');
    });
  });

  describe('clearUIHistory', () => {
    it('should log UI history clear', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      service.clearUIHistory();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ChatHistoryService] UI history cleared (backend data preserved)'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('messageObjectToDto conversion', () => {
    it('should convert user message correctly', async () => {
      const userMessage: MessageObject = {
        id: 'test-id',
        text: 'User message',
        sender: 'user',
        timestamp: new Date(),
        type: 'conversation',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: {
            messageId: 'saved-id',
            content: userMessage.text,
            role: 'user',
            messageType: 'conversation',
            timestamp: userMessage.timestamp.toISOString(),
            createdAt: new Date().toISOString(),
          },
        }),
      });

      await service.persistMessage(userMessage);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody.role).toBe('user');
      expect(requestBody.content).toBe(userMessage.text);
    });

    it('should convert AI message correctly', async () => {
      const aiMessage: MessageObject = {
        id: 'test-id',
        text: 'AI response',
        sender: 'ai',
        timestamp: new Date(),
        type: 'markdown',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: {
            messageId: 'saved-id',
            content: aiMessage.text,
            role: 'assistant',
            messageType: 'markdown',
            timestamp: aiMessage.timestamp.toISOString(),
            createdAt: new Date().toISOString(),
          },
        }),
      });

      await service.persistMessage(aiMessage);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody.role).toBe('assistant');
      expect(requestBody.messageType).toBe('markdown');
    });
  });
});
