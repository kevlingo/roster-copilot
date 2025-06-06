/**
 * Chat History Models
 * Defines the data models for chat history persistence
 */

export interface ChatMessage {
  messageId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  messageType?: 'conversation' | 'notification' | 'markdown' | 'component';
  componentType?: string;
  componentProps?: unknown;
  conversationContext?: OnboardingContext | GeneralChatContext;
  timestamp: Date;
  createdAt: Date;
}

export interface ConversationSession {
  sessionId: string;
  userId: string;
  conversationType: 'onboarding' | 'general' | 'digest';
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  isActive: boolean;
  deviceInfo?: DeviceInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingContext {
  phase: 'greeting' | 'mode-selection' | 'archetype-selection' | 'confirmation' | 'complete';
  selectedArchetype?: string;
  selectedMode?: 'quick' | 'full';
  attempts?: number;
  isComplete?: boolean;
}

export interface GeneralChatContext {
  topic?: string;
  previousContext?: string;
  userPreferences?: Record<string, unknown>;
}

export interface DeviceInfo {
  userAgent?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  platform?: string;
  sessionId?: string;
}

// Database row interfaces (for DAL layer)
export interface ChatMessageRow {
  messageId: string;
  userId: string;
  content: string;
  role: string;
  messageType: string;
  componentType: string | null;
  componentProps: string | null; // JSON string
  conversationContext: string | null; // JSON string
  timestamp: string; // ISO string
  createdAt: string; // ISO string
}

export interface ConversationSessionRow {
  sessionId: string;
  userId: string;
  conversationType: string;
  startTime: string; // ISO string
  lastActivity: string; // ISO string
  messageCount: number;
  isActive: number; // SQLite boolean (0/1)
  deviceInfo: string | null; // JSON string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Utility functions for model conversion
export function chatMessageFromRow(row: ChatMessageRow): ChatMessage {
  return {
    messageId: row.messageId,
    userId: row.userId,
    content: row.content,
    role: row.role as 'user' | 'assistant' | 'system',
    messageType: row.messageType as 'conversation' | 'notification' | 'markdown' | 'component',
    componentType: row.componentType || undefined,
    componentProps: row.componentProps ? JSON.parse(row.componentProps) : undefined,
    conversationContext: row.conversationContext ? JSON.parse(row.conversationContext) : undefined,
    timestamp: new Date(row.timestamp),
    createdAt: new Date(row.createdAt),
  };
}

export function chatMessageToRow(message: ChatMessage): Omit<ChatMessageRow, 'createdAt'> {
  return {
    messageId: message.messageId,
    userId: message.userId,
    content: message.content,
    role: message.role,
    messageType: message.messageType || 'conversation',
    componentType: message.componentType || null,
    componentProps: message.componentProps ? JSON.stringify(message.componentProps) : null,
    conversationContext: message.conversationContext ? JSON.stringify(message.conversationContext) : null,
    timestamp: message.timestamp.toISOString(),
  };
}

export function conversationSessionFromRow(row: ConversationSessionRow): ConversationSession {
  return {
    sessionId: row.sessionId,
    userId: row.userId,
    conversationType: row.conversationType as 'onboarding' | 'general' | 'digest',
    startTime: new Date(row.startTime),
    lastActivity: new Date(row.lastActivity),
    messageCount: row.messageCount,
    isActive: Boolean(row.isActive),
    deviceInfo: row.deviceInfo ? JSON.parse(row.deviceInfo) : undefined,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export function conversationSessionToRow(session: ConversationSession): Omit<ConversationSessionRow, 'createdAt' | 'updatedAt'> {
  return {
    sessionId: session.sessionId,
    userId: session.userId,
    conversationType: session.conversationType,
    startTime: session.startTime.toISOString(),
    lastActivity: session.lastActivity.toISOString(),
    messageCount: session.messageCount,
    isActive: session.isActive ? 1 : 0,
    deviceInfo: session.deviceInfo ? JSON.stringify(session.deviceInfo) : null,
  };
}
