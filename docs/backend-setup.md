# Backend Setup & Core Utilities

This document outlines key setup information and core utilities for the backend API.

## API Route Handler Wrappers

To ensure consistent behavior and observability across API Route Handlers (located in `app/api/`), we use a set of composable utility wrappers. These wrappers are found in `lib/api/middleware/route-handlers.ts`.

### Available Wrappers

1.  **`withErrorHandling(handler: ApiRouteHandler)`**:
    *   Catches unhandled errors from the wrapped `handler`.
    *   Logs detailed error information server-side (timestamp, method, path, error message, stack).
    *   Returns a generic JSON response `{ "error": "Internal Server Error" }` with HTTP status code 500.

2.  **`withRequestLogging(handler: ApiRouteHandler)`**:
    *   Logs key information for each incoming request (timestamp, method, path, user-agent, IP).
    *   Logs key information for the outgoing response (original request details, response status, duration in ms).

3.  **`withAuth(handler: ApiRouteHandler)` (Stub)**:
    *   A placeholder for future authentication logic (related to Story 1.2).
    *   Currently logs a message indicating it's a stub and then calls the wrapped `handler`.
    *   In the future, this will validate session/token and return a 401/403 if authentication fails.

### Composition

The wrappers are designed to be composed using the `composeWrappers` utility:

`composeWrappers(...wrappers: ((handler: ApiRouteHandler) => ApiRouteHandler)[])`

This utility takes multiple wrapper functions and returns a new function that, when given an `ApiRouteHandler`, applies the wrappers to it. Wrappers are applied from right to left (innermost to outermost).

**Example Usage:**

```typescript
// In your app/api/.../route.ts file

import { NextRequest, NextResponse } from 'next/server';
import {
  ApiRouteHandler,
  composeWrappers,
  withErrorHandling,
  withRequestLogging,
  withAuth,
} from '@/lib/api/middleware/route-handlers';

// Your base API logic
const myApiHandler: ApiRouteHandler = async (req) => {
  // ... your route logic
  return NextResponse.json({ message: 'Success!' });
};

// Apply the wrappers
const composedGetHandler = composeWrappers(
  withErrorHandling,  // Applied third (outermost)
  withRequestLogging, // Applied second
  withAuth            // Applied first (innermost, closest to the actual handler)
)(myApiHandler);

export async function GET(req: NextRequest) {
  return composedGetHandler(req);
}

// Similarly for POST, PUT, DELETE etc.
// export async function POST(req: NextRequest) {
//   return composedPostHandler(req); // Assuming a composedPostHandler
// }

```

**Order of Execution:**

When a request hits an endpoint using the example composition:

1.  `withAuth` executes (stubbed auth check).
2.  If auth passes (currently always does), `withRequestLogging` logs the incoming request.
3.  The actual `myApiHandler` executes.
4.  `withRequestLogging` logs the outgoing response (status, duration).
5.  `withErrorHandling` (if an unhandled error occurred anywhere in the chain, it would be caught here).

This pattern ensures that all API routes benefit from standardized logging, error handling, and (eventually) authentication by simply wrapping the core route logic.