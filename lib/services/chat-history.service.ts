/**
 * Chat History Service
 * Frontend service for managing chat history persistence and synchronization
 */

import { MessageObject } from '@/src/types/chat';
import {
  SaveChatMessageRequestDto,
  SaveChatMessageResponseDto,
  GetChatHistoryResponseDto,
  ChatMessageDto,
  CreateConversationSessionRequestDto,
  CreateConversationSessionResponseDto,
  SyncConversationStateResponseDto,
} from '@/lib/dtos/chat.dto';

export interface ChatHistoryServiceOptions {
  baseUrl?: string;
  authToken?: string;
}

export class ChatHistoryService {
  private baseUrl: string;
  private authToken?: string;

  constructor(options: ChatHistoryServiceOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.authToken = options.authToken;
  }

  /**
   * Update the auth token for API requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Convert MessageObject to ChatMessageDto for API requests
   */
  private messageObjectToDto(message: MessageObject): SaveChatMessageRequestDto {
    return {
      content: message.text,
      role: message.sender === 'user' ? 'user' : 'assistant',
      messageType: message.type || 'conversation',
      componentType: message.componentType,
      componentProps: message.componentProps,
      conversationContext: undefined, // Will be set based on context
      timestamp: message.timestamp.toISOString(),
    };
  }

  /**
   * Convert ChatMessageDto to MessageObject for frontend use
   */
  private dtoToMessageObject(dto: ChatMessageDto): MessageObject {
    return {
      id: dto.messageId,
      text: dto.content,
      sender: dto.role === 'user' ? 'user' : 'ai',
      timestamp: new Date(dto.timestamp),
      type: dto.messageType,
      componentType: dto.componentType as 'archetype-selection' | undefined,
      componentProps: dto.componentProps,
    };
  }

  /**
   * Save a chat message to the backend
   */
  async persistMessage(message: MessageObject, conversationContext?: unknown): Promise<MessageObject> {
    try {
      const requestDto = this.messageObjectToDto(message);
      if (conversationContext) {
        requestDto.conversationContext = conversationContext;
      }

      const response = await fetch(`${this.baseUrl}/api/chat/history`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestDto),
      });

      if (!response.ok) {
        throw new Error(`Failed to persist message: ${response.status} ${response.statusText}`);
      }

      const result: SaveChatMessageResponseDto = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to persist message: API returned success=false');
      }

      return this.dtoToMessageObject(result.message);
    } catch (error) {
      console.error('[ChatHistoryService] Error persisting message:', error);
      throw error;
    }
  }

  /**
   * Load conversation history from the backend
   */
  async loadConversationHistory(options: {
    limit?: number;
    offset?: number;
    conversationType?: 'onboarding' | 'general' | 'digest';
    since?: Date;
  } = {}): Promise<{
    messages: MessageObject[];
    totalCount: number;
    hasMore: boolean;
    nextOffset?: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.conversationType) params.append('conversationType', options.conversationType);
      if (options.since) params.append('since', options.since.toISOString());

      const response = await fetch(`${this.baseUrl}/api/chat/history?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to load chat history: ${response.status} ${response.statusText}`);
      }

      const result: GetChatHistoryResponseDto = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to load chat history: API returned success=false');
      }

      return {
        messages: result.messages.map(dto => this.dtoToMessageObject(dto)),
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        nextOffset: result.nextOffset,
      };
    } catch (error) {
      console.error('[ChatHistoryService] Error loading chat history:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation session
   */
  async createConversationSession(
    conversationType: 'onboarding' | 'general' | 'digest',
    deviceInfo?: {
      userAgent?: string;
      deviceType?: 'mobile' | 'tablet' | 'desktop';
      platform?: string;
    }
  ): Promise<string> {
    try {
      const requestDto: CreateConversationSessionRequestDto = {
        conversationType,
        deviceInfo,
      };

      const response = await fetch(`${this.baseUrl}/api/chat/sessions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestDto),
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation session: ${response.status} ${response.statusText}`);
      }

      const result: CreateConversationSessionResponseDto = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to create conversation session: API returned success=false');
      }

      return result.session.sessionId;
    } catch (error) {
      console.error('[ChatHistoryService] Error creating conversation session:', error);
      throw error;
    }
  }

  /**
   * Sync conversation state across devices
   */
  async syncConversationState(deviceId: string, lastSyncTimestamp?: Date): Promise<{
    messages: MessageObject[];
    lastSyncTimestamp: Date;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('deviceId', deviceId);
      if (lastSyncTimestamp) {
        params.append('since', lastSyncTimestamp.toISOString());
      }

      const response = await fetch(`${this.baseUrl}/api/chat/sync?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync conversation state: ${response.status} ${response.statusText}`);
      }

      const result: SyncConversationStateResponseDto = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to sync conversation state: API returned success=false');
      }

      return {
        messages: result.messages.map(dto => this.dtoToMessageObject(dto)),
        lastSyncTimestamp: new Date(result.lastSyncTimestamp),
      };
    } catch (error) {
      console.error('[ChatHistoryService] Error syncing conversation state:', error);
      throw error;
    }
  }

  /**
   * Clear UI history (this is a local operation only)
   * Backend storage remains intact
   */
  clearUIHistory(): void {
    // This is handled by the component state
    // No backend operation needed
    console.log('[ChatHistoryService] UI history cleared (backend data preserved)');
  }
}

// Export a singleton instance
export const chatHistoryService = new ChatHistoryService();
