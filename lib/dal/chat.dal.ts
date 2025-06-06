/**
 * Chat History Data Access Layer
 * Handles database operations for chat history and conversation sessions
 */

import { connectDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import {
  ChatMessage,
  ConversationSession,
  ChatMessageRow,
  ConversationSessionRow,
  chatMessageFromRow,
  chatMessageToRow,
  conversationSessionFromRow,
  conversationSessionToRow,
} from '../models/chat.models';

/**
 * Save a chat message to the database
 */
export async function saveChatMessage(message: Omit<ChatMessage, 'messageId' | 'createdAt'>): Promise<ChatMessage> {
  const db = await connectDb();
  
  const messageId = uuidv4();
  const now = new Date();
  const fullMessage: ChatMessage = {
    ...message,
    messageId,
    createdAt: now,
  };

  const row = chatMessageToRow(fullMessage);
  
  const sql = `
    INSERT INTO ChatHistory (
      messageId, userId, content, role, messageType, componentType, 
      componentProps, conversationContext, timestamp, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    row.messageId,
    row.userId,
    row.content,
    row.role,
    row.messageType,
    row.componentType,
    row.componentProps,
    row.conversationContext,
    row.timestamp,
    now.toISOString(),
  ];

  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('[ChatDAL] Error saving chat message:', err);
        reject(err);
      } else {
        console.log(`[ChatDAL] Chat message saved with ID: ${messageId}`);
        resolve(fullMessage);
      }
    });
  });
}

/**
 * Get chat history for a user with pagination
 */
export async function getChatHistory(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    conversationType?: string;
    since?: Date;
  } = {}
): Promise<{ messages: ChatMessage[]; totalCount: number }> {
  const db = await connectDb();

  const { limit = 50, offset = 0, since } = options;
  
  let sql = `
    SELECT messageId, userId, content, role, messageType, componentType,
           componentProps, conversationContext, timestamp, createdAt
    FROM ChatHistory 
    WHERE userId = ?
  `;
  
  const params: unknown[] = [userId];
  
  if (since) {
    sql += ' AND timestamp > ?';
    params.push(since.toISOString());
  }
  
  sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  // Get total count
  let countSql = 'SELECT COUNT(*) as count FROM ChatHistory WHERE userId = ?';
  const countParams: unknown[] = [userId];
  
  if (since) {
    countSql += ' AND timestamp > ?';
    countParams.push(since.toISOString());
  }

  return new Promise((resolve, reject) => {
    // First get the count
    db.get(countSql, countParams, (err, countRow: { count: number }) => {
      if (err) {
        console.error('[ChatDAL] Error getting chat history count:', err);
        reject(err);
        return;
      }

      // Then get the messages
      db.all(sql, params, (err, rows: ChatMessageRow[]) => {
        if (err) {
          console.error('[ChatDAL] Error getting chat history:', err);
          reject(err);
        } else {
          const messages = rows.map(chatMessageFromRow);
          console.log(`[ChatDAL] Retrieved ${messages.length} messages for user ${userId}`);
          resolve({
            messages,
            totalCount: countRow.count,
          });
        }
      });
    });
  });
}

/**
 * Create a new conversation session
 */
export async function createConversationSession(
  session: Omit<ConversationSession, 'sessionId' | 'createdAt' | 'updatedAt'>
): Promise<ConversationSession> {
  const db = await connectDb();
  
  const sessionId = uuidv4();
  const now = new Date();
  const fullSession: ConversationSession = {
    ...session,
    sessionId,
    createdAt: now,
    updatedAt: now,
  };

  const row = conversationSessionToRow(fullSession);
  
  const sql = `
    INSERT INTO ConversationSessions (
      sessionId, userId, conversationType, startTime, lastActivity,
      messageCount, isActive, deviceInfo, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    row.sessionId,
    row.userId,
    row.conversationType,
    row.startTime,
    row.lastActivity,
    row.messageCount,
    row.isActive,
    row.deviceInfo,
    now.toISOString(),
    now.toISOString(),
  ];

  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('[ChatDAL] Error creating conversation session:', err);
        reject(err);
      } else {
        console.log(`[ChatDAL] Conversation session created with ID: ${sessionId}`);
        resolve(fullSession);
      }
    });
  });
}

/**
 * Update conversation session activity
 */
export async function updateConversationSessionActivity(
  sessionId: string,
  messageCount?: number
): Promise<void> {
  const db = await connectDb();
  
  const now = new Date();
  let sql = 'UPDATE ConversationSessions SET lastActivity = ?, updatedAt = ?';
  const params: unknown[] = [now.toISOString(), now.toISOString()];
  
  if (messageCount !== undefined) {
    sql += ', messageCount = ?';
    params.push(messageCount);
  }
  
  sql += ' WHERE sessionId = ?';
  params.push(sessionId);

  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('[ChatDAL] Error updating conversation session:', err);
        reject(err);
      } else {
        console.log(`[ChatDAL] Conversation session ${sessionId} updated`);
        resolve();
      }
    });
  });
}

/**
 * Get active conversation sessions for a user
 */
export async function getActiveConversationSessions(userId: string): Promise<ConversationSession[]> {
  const db = await connectDb();
  
  const sql = `
    SELECT sessionId, userId, conversationType, startTime, lastActivity,
           messageCount, isActive, deviceInfo, createdAt, updatedAt
    FROM ConversationSessions 
    WHERE userId = ? AND isActive = 1
    ORDER BY lastActivity DESC
  `;

  return new Promise((resolve, reject) => {
    db.all(sql, [userId], (err, rows: ConversationSessionRow[]) => {
      if (err) {
        console.error('[ChatDAL] Error getting active conversation sessions:', err);
        reject(err);
      } else {
        const sessions = rows.map(conversationSessionFromRow);
        console.log(`[ChatDAL] Retrieved ${sessions.length} active sessions for user ${userId}`);
        resolve(sessions);
      }
    });
  });
}

/**
 * Deactivate a conversation session
 */
export async function deactivateConversationSession(sessionId: string): Promise<void> {
  const db = await connectDb();
  
  const now = new Date();
  const sql = 'UPDATE ConversationSessions SET isActive = 0, updatedAt = ? WHERE sessionId = ?';

  return new Promise((resolve, reject) => {
    db.run(sql, [now.toISOString(), sessionId], function(err) {
      if (err) {
        console.error('[ChatDAL] Error deactivating conversation session:', err);
        reject(err);
      } else {
        console.log(`[ChatDAL] Conversation session ${sessionId} deactivated`);
        resolve();
      }
    });
  });
}

/**
 * Delete chat messages older than a certain date (for cleanup)
 */
export async function deleteChatMessagesOlderThan(userId: string, cutoffDate: Date): Promise<number> {
  const db = await connectDb();
  
  const sql = 'DELETE FROM ChatHistory WHERE userId = ? AND timestamp < ?';

  return new Promise((resolve, reject) => {
    db.run(sql, [userId, cutoffDate.toISOString()], function(err) {
      if (err) {
        console.error('[ChatDAL] Error deleting old chat messages:', err);
        reject(err);
      } else {
        console.log(`[ChatDAL] Deleted ${this.changes} old messages for user ${userId}`);
        resolve(this.changes || 0);
      }
    });
  });
}
