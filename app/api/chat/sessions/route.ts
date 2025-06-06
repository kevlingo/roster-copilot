/**
 * Conversation Sessions API Routes
 * GET /api/chat/sessions - Get active conversation sessions for authenticated user
 * POST /api/chat/sessions - Create a new conversation session
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
  createConversationSession,
  getActiveConversationSessions,
} from '@/lib/dal/chat.dal';
import {
  CreateConversationSessionRequestDto,
  CreateConversationSessionResponseDto,
  GetConversationSessionsResponseDto,
  ChatErrorResponseDto,
  conversationSessionToDto,
} from '@/lib/dtos/chat.dto';

/**
 * GET /api/chat/sessions
 * Get active conversation sessions for the authenticated user
 */
const getConversationSessionsHandler: AuthenticatedApiRouteHandler = async (req: AuthenticatedRequest) => {
  await initializeDatabase();

  try {
    const sessions = await getActiveConversationSessions(req.user.userId);
    
    const response: GetConversationSessionsResponseDto = {
      success: true,
      sessions: sessions.map(conversationSessionToDto),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Conversation Sessions API] Error getting sessions:', error);
    const errorResponse: ChatErrorResponseDto = {
      error: 'Failed to retrieve conversation sessions',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};

/**
 * POST /api/chat/sessions
 * Create a new conversation session for the authenticated user
 */
const createConversationSessionHandler: AuthenticatedApiRouteHandler = async (req: AuthenticatedRequest) => {
  await initializeDatabase();

  try {
    const body: CreateConversationSessionRequestDto = await req.json();
    
    // Validate required fields
    if (!body.conversationType) {
      const errorResponse: ChatErrorResponseDto = {
        error: 'Missing required fields',
        details: 'conversationType is required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate conversationType
    if (!['onboarding', 'general', 'digest'].includes(body.conversationType)) {
      const errorResponse: ChatErrorResponseDto = {
        error: 'Invalid conversationType',
        details: 'conversationType must be one of: onboarding, general, digest',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create the session object
    const now = new Date();
    const sessionData = {
      userId: req.user.userId,
      conversationType: body.conversationType,
      startTime: now,
      lastActivity: now,
      messageCount: 0,
      isActive: true,
      deviceInfo: body.deviceInfo,
    };

    // Save the session
    const savedSession = await createConversationSession(sessionData);

    const response: CreateConversationSessionResponseDto = {
      success: true,
      session: conversationSessionToDto(savedSession),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Conversation Sessions API] Error creating session:', error);
    
    if (error instanceof SyntaxError) {
      const errorResponse: ChatErrorResponseDto = {
        error: 'Invalid JSON in request body',
        details: error.message,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const errorResponse: ChatErrorResponseDto = {
      error: 'Failed to create conversation session',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
};

// Export the handlers with middleware applied
export const GET = withRequestLogging(
  withErrorHandling(
    withAuth(getConversationSessionsHandler)
  )
);

export const POST = withRequestLogging(
  withErrorHandling(
    withAuth(createConversationSessionHandler)
  )
);
