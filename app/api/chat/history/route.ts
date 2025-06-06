/**
 * Chat History API Routes
 * GET /api/chat/history - Get chat history for authenticated user
 * POST /api/chat/history - Save a new chat message
 */

import { NextResponse } from 'next/server';
import {
  withErrorHandling,
  withRequestLogging,
  withAuth,
  AuthenticatedRequest,
  AuthenticatedApiRouteHandler,
} from '@/lib/api/middleware/route-handlers';
import { initializeDatabase } from '@/lib/dal/db';
import {
  saveChatMessage,
  getChatHistory,
} from '@/lib/dal/chat.dal';
import {
  SaveChatMessageRequestDto,
  SaveChatMessageResponseDto,
  GetChatHistoryResponseDto,
  ChatErrorResponseDto,
  chatMessageToDto,
} from '@/lib/dtos/chat.dto';
import type { OnboardingContext, GeneralChatContext } from '@/lib/models/chat.models';

/**
 * GET /api/chat/history
 * Get chat history for the authenticated user
 */
const getChatHistoryHandler: AuthenticatedApiRouteHandler = async (req: AuthenticatedRequest) => {
  await initializeDatabase();

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const conversationType = searchParams.get('conversationType') || undefined;
  const since = searchParams.get('since');

  const options: Parameters<typeof getChatHistory>[1] = {
    limit: Math.min(limit, 100), // Cap at 100 messages per request
    offset,
    conversationType,
    since: since ? new Date(since) : undefined,
  };

  try {
    const { messages, totalCount } = await getChatHistory(req.user.userId, options);
    
    const response: GetChatHistoryResponseDto = {
      success: true,
      messages: messages.map(chatMessageToDto),
      totalCount,
      hasMore: offset + messages.length < totalCount,
      nextOffset: offset + messages.length < totalCount ? offset + messages.length : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Chat History API] Error getting chat history:', error);
    const errorResponse: ChatErrorResponseDto = {
      error: 'Failed to retrieve chat history',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};

/**
 * POST /api/chat/history
 * Save a new chat message for the authenticated user
 */
const saveChatMessageHandler: AuthenticatedApiRouteHandler = async (req: AuthenticatedRequest) => {
  await initializeDatabase();

  try {
    const body: SaveChatMessageRequestDto = await req.json();
    
    // Validate required fields
    if (!body.content || !body.role) {
      const errorResponse: ChatErrorResponseDto = {
        error: 'Missing required fields',
        details: 'content and role are required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate role
    if (!['user', 'assistant', 'system'].includes(body.role)) {
      const errorResponse: ChatErrorResponseDto = {
        error: 'Invalid role',
        details: 'role must be one of: user, assistant, system',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create the message object
    const messageData = {
      userId: req.user.userId,
      content: body.content,
      role: body.role,
      messageType: body.messageType || 'conversation',
      componentType: body.componentType,
      componentProps: body.componentProps,
      conversationContext: body.conversationContext as OnboardingContext | GeneralChatContext | undefined,
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
    };

    // Save the message
    const savedMessage = await saveChatMessage(messageData);

    // TODO: Update conversation session activity if we have session tracking
    // This would require session management which we'll implement later

    const response: SaveChatMessageResponseDto = {
      success: true,
      message: chatMessageToDto(savedMessage),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Chat History API] Error saving chat message:', error);
    
    if (error instanceof SyntaxError) {
      const errorResponse: ChatErrorResponseDto = {
        error: 'Invalid JSON in request body',
        details: error.message,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const errorResponse: ChatErrorResponseDto = {
      error: 'Failed to save chat message',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};

// Export the handlers with middleware applied
export const GET = withRequestLogging(
  withErrorHandling(
    withAuth(getChatHistoryHandler)
  )
);

export const POST = withRequestLogging(
  withErrorHandling(
    withAuth(saveChatMessageHandler)
  )
);
