import { NextRequest, NextResponse } from 'next/server';
import {
  ApiRouteHandler,
  composeWrappers,
  withErrorHandling,
  withRequestLogging,
  withAuth, // Optional: include if you want to test the auth stub
} from '@/lib/api/middleware/route-handlers';

// A simple handler that might succeed or throw an error based on a query param
const testMiddlewareHandler: ApiRouteHandler = async (req) => {
  const { searchParams } = new URL(req.url);
  const shouldError = searchParams.get('error') === 'true';

  if (shouldError) {
    throw new Error('This is a deliberate test error from the API route.');
  }

  return NextResponse.json({ message: 'Test middleware route executed successfully!' });
};

// Compose the wrappers around the handler
// Order: withErrorHandling (outermost), then withRequestLogging, then withAuth (innermost applied to handler)
// Correction: Wrappers are applied from right to left (inner to outer).
// So, withAuth is applied first, then withRequestLogging, then withErrorHandling.
// The composeWrappers function applies them right-to-left, so the order below is correct:
// Handler -> withAuth -> withRequestLogging -> withErrorHandling
const composedHandler = composeWrappers(
  withErrorHandling,
  withRequestLogging,
  withAuth,
)(testMiddlewareHandler);

// Export the GET method using the composed handler
export async function GET(req: NextRequest) {
  return composedHandler(req);
}

// Example for POST if needed, applying the same composed handler
// export async function POST(req: NextRequest) {
//   return composedHandler(req);
// }