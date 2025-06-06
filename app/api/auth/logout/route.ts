import { NextRequest, NextResponse } from 'next/server';
import {
  composeWrappers,
  withErrorHandling,
  withRequestLogging,
} from '@/lib/api/middleware/route-handlers';

/**
 * Handles user logout requests.
 * 
 * For PoC with stateless JWTs, this endpoint primarily serves to:
 * 1. Log the logout event for audit purposes
 * 2. Provide a clean logout process
 * 3. Enable future enhancements like token denylist
 * 
 * The actual session termination happens client-side by discarding the JWT token.
 */
async function logoutHandler(req: NextRequest): Promise<NextResponse> {
  // For PoC, we don't need to validate the token since logout should always succeed
  // In a production system, you might want to:
  // 1. Validate the JWT token
  // 2. Add the token to a denylist
  // 3. Clear server-side session data
  
  // Log the logout event for audit purposes
  console.log('[Auth] User logout initiated', {
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
  });

  // TODO: Future enhancements could include:
  // - Token validation and denylist addition
  // - Server-side session cleanup
  // - User activity logging

  return NextResponse.json({
    message: 'Logout successful',
    timestamp: new Date().toISOString(),
  });
}

// Apply middleware: error handling and request logging
export const POST = composeWrappers(
  withRequestLogging,
  withErrorHandling,
)(logoutHandler);
