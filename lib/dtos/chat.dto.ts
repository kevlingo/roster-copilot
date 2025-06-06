/**
 * Chat History DTOs
 * Data Transfer Objects for chat history API endpoints
 */

// Request DTOs
export interface SaveChatMessageRequestDto {
  content: string;
  role: 'user' | 'assistant' | 'system';
  messageType?: 'conversation' | 'notification' | 'markdown' | 'component';
  componentType?: string;
  componentProps?: unknown;
  conversationContext?: unknown;
  timestamp?: string; // ISO string, optional - server can set if not provided
}

export interface GetChatHistoryRequestDto {
  limit?: number;
  offset?: number;
  conversationType?: 'onboarding' | 'general' | 'digest';
  since?: string; // ISO string for incremental sync
}

export interface CreateConversationSessionRequestDto {
  conversationType: 'onboarding' | 'general' | 'digest';
  deviceInfo?: {
    userAgent?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    platform?: string;
  };
}

// Response DTOs
export interface ChatMessageDto {
  messageId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  messageType: 'conversation' | 'notification' | 'markdown' | 'component';
  componentType?: string;
  componentProps?: unknown;
  conversationContext?: unknown;
  timestamp: string; // ISO string
  createdAt: string; // ISO string
}

export interface ConversationSessionDto {
  sessionId: string;
  conversationType: 'onboarding' | 'general' | 'digest';
  startTime: string; // ISO string
  lastActivity: string; // ISO string
  messageCount: number;
  isActive: boolean;
  deviceInfo?: {
    userAgent?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    platform?: string;
  };
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface SaveChatMessageResponseDto {
  success: boolean;
  message: ChatMessageDto;
}

export interface GetChatHistoryResponseDto {
  success: boolean;
  messages: ChatMessageDto[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface CreateConversationSessionResponseDto {
  success: boolean;
  session: ConversationSessionDto;
}

export interface GetConversationSessionsResponseDto {
  success: boolean;
  sessions: ConversationSessionDto[];
}

export interface SyncConversationStateResponseDto {
  success: boolean;
  messages: ChatMessageDto[];
  currentSession?: ConversationSessionDto;
  lastSyncTimestamp: string; // ISO string
}

// Error DTOs
export interface ChatErrorResponseDto {
  error: string;
  details?: string;
  code?: string;
}

// Utility functions for DTO conversion
export function chatMessageToDto(message: import('../models/chat.models').ChatMessage): ChatMessageDto {
  return {
    messageId: message.messageId,
    content: message.content,
    role: message.role,
    messageType: message.messageType || 'conversation',
    componentType: message.componentType,
    componentProps: message.componentProps,
    conversationContext: message.conversationContext,
    timestamp: message.timestamp.toISOString(),
    createdAt: message.createdAt.toISOString(),
  };
}

export function conversationSessionToDto(session: import('../models/chat.models').ConversationSession): ConversationSessionDto {
  return {
    sessionId: session.sessionId,
    conversationType: session.conversationType,
    startTime: session.startTime.toISOString(),
    lastActivity: session.lastActivity.toISOString(),
    messageCount: session.messageCount,
    isActive: session.isActive,
    deviceInfo: session.deviceInfo,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}
