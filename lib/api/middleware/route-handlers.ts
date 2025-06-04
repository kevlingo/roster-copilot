import { NextRequest, NextResponse } from 'next/server';

// Define a type for our API Route Handlers for better type safety
export type ApiRouteHandler = (
  req: NextRequest,
  params?: { [key: string]: string | string[] | undefined },
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps an API Route Handler with standardized error handling.
 * Catches unhandled errors, logs them server-side, and returns a generic
 * JSON error response.
 *
 * @param handler The API Route Handler to wrap.
 * @returns A new handler function with error handling.
 */
export function withErrorHandling(handler: ApiRouteHandler): ApiRouteHandler {
  return async (req, params) => {
    try {
      return await handler(req, params);
    } catch (error) {
      console.error('[API Error]', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        // Potentially include request details if safe and helpful for debugging
        // Be cautious about logging sensitive request body data
      });

      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 },
      );
    }
  };
}

/**
 * Wraps an API Route Handler with request logging.
 * Logs key information about the incoming request and the outgoing response.
 *
 * @param handler The API Route Handler to wrap.
 * @returns A new handler function with request logging.
 */
export function withRequestLogging(handler: ApiRouteHandler): ApiRouteHandler {
  return async (req, params) => {
    const startTime = Date.now();
    const requestDetails = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.nextUrl.pathname,
      userAgent: req.headers.get('user-agent'),
      ip: req.ip || req.headers.get('x-forwarded-for'), // Best effort for IP
    };

    console.log('[API Request]', requestDetails);

    let response: NextResponse;
    try {
      response = await handler(req, params);
    } catch (error) {
      // This error will be caught by withErrorHandling if composed correctly,
      // but we log here to ensure we capture the intended status for the log.
      // If withErrorHandling is not used, this provides basic error info for logging.
      const durationMs = Date.now() - startTime;
      console.error('[API Response - Unhandled Error]', {
        ...requestDetails,
        status: 500, // Assume 500 if error bubbles up here
        durationMs,
        errorMessage: error instanceof Error ? error.message : 'Unknown error during request processing',
      });
      throw error; // Re-throw to be caught by withErrorHandling
    }

    const durationMs = Date.now() - startTime;
    console.log('[API Response]', {
      ...requestDetails,
      status: response.status,
      durationMs,
    });

    return response;
  };
}

/**
 * (Stub) Wraps an API Route Handler with an authentication check.
 * This is a placeholder for future authentication logic (Story 1.2).
 *
 * @param handler The API Route Handler to wrap.
 * @returns A new handler function with a stubbed authentication check.
 */
export function withAuth(handler: ApiRouteHandler): ApiRouteHandler {
  return async (req, params) => {
    // TODO: Implement session/token validation logic here (Story 1.2)
    // For now, we'll simulate a successful authentication check.
    // In a real scenario, if auth fails, you would return:
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    console.log('[Auth Stub] Placeholder authentication check passed.');
    return handler(req, params);
  };
}

/**
 * Composes multiple API Route Handler wrappers.
 * Wrappers are applied from right to left (inner to outer).
 * e.g., composeWrappers(withAuth, withRequestLogging, withErrorHandling)(handler)
 * means withErrorHandling is applied first, then withRequestLogging, then withAuth.
 *
 * @param wrappers The wrapper functions to compose.
 * @returns A function that takes a handler and returns the composed handler.
 */
export function composeWrappers(...wrappers: ((handler: ApiRouteHandler) => ApiRouteHandler)[]) {
  return (handler: ApiRouteHandler): ApiRouteHandler =>
    wrappers.reduceRight((acc, wrapper) => wrapper(acc), handler);
}