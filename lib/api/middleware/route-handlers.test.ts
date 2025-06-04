// import { NextRequest, NextResponse } from 'next/server'; // We are mocking these below

// Mock next/server before importing the module that uses it
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ // Mock NextResponse.json behavior
      status: init?.status || 200,
      json: async () => body,
      headers: new Map(), // Add a minimal headers mock if needed by your code
    })),
  },
  // NextRequest can be a simple constructor mock if not heavily used,
  // or more detailed if specific properties/methods are accessed by SUT.
  // For this SUT, it primarily uses req.method, req.nextUrl.pathname, req.headers.get, req.ip
  // These are provided by our createMockRequest, so the constructor itself doesn't need much.
  NextRequest: jest.fn((input, init) => ({
    // Mock properties that might be accessed by NextRequest constructor or internals
    // if not covered by createMockRequest. For now, keep it simple.
    // This mock is mostly to prevent errors when `new NextRequest()` is called by Next.js internals
    // if the test environment tries to actually instantiate it.
    // Our `createMockRequest` directly builds the object structure we need.
    url: typeof input === 'string' ? input : input.url,
    method: init?.method || 'GET',
    headers: new Map(Object.entries(init?.headers || {})),
    nextUrl: { pathname: new URL(typeof input === 'string' ? input : input.url).pathname },
    // ... other basic properties if needed
  })),
}));

import {
  ApiRouteHandler,
  withErrorHandling,
  withRequestLogging,
  withAuth,
  composeWrappers,
} from './route-handlers';

// Mock console.log and console.error
let consoleLogSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

const mockSuccessHandler: ApiRouteHandler = async (_req) => { // Renamed req to _req as it's not used
  return mockNextResponseJson({ message: 'Success' }, { status: 200 }) as any; // Use the mock
};

const mockErrorHandler: ApiRouteHandler = async (_req) => { // Renamed req to _req
  throw new Error('Test error from handler');
};

// Define simple mock types/interfaces for what our wrappers use
interface MockableNextRequest {
  method: string;
  nextUrl: {
    pathname: string;
  };
  headers: {
    get: (key: string) => string | null;
  };
  url: string;
  ip?: string;
  json?: () => Promise<any>;
  text?: () => Promise<string>;
  // Add other properties/methods if your handlers/wrappers use them
}

interface MockableNextResponse {
  status: number;
  json: () => Promise<any>;
  // Add other properties/methods if your handlers/wrappers use them
}


const createMockRequest = (
  urlPath = '/api/test',
  method = 'GET',
  headers: Record<string, string> = {},
  ip?: string
): MockableNextRequest => {
  const fullUrl = `http://localhost${urlPath}`;
  return {
    method,
    nextUrl: {
      pathname: urlPath,
    },
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
    },
    url: fullUrl,
    ip: ip,
  };
};

// Mock NextResponse.json()
const mockNextResponseJson = (body: any, init?: { status?: number }): MockableNextResponse => {
  return {
    status: init?.status || 200,
    json: async () => body,
  };
};


describe('API Route Handler Wrappers', () => {
  describe('withErrorHandling', () => {
    it('should return handler response on success', async () => {
      const req = createMockRequest();
      const mockSuccessHandlerWithMockResponse: ApiRouteHandler = async (_req) => {
        return mockNextResponseJson({ message: 'Success' }, { status: 200 }) as any;
      };
      const wrappedHandler = withErrorHandling(mockSuccessHandlerWithMockResponse);
      const response = await wrappedHandler(req as any); // Cast to any for the mock
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ message: 'Success' });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should catch errors, log them, and return 500 response', async () => {
      const req = createMockRequest('/api/error-test');
      const wrappedHandler = withErrorHandling(mockErrorHandler);
      const response = await wrappedHandler(req as any); // Cast to any
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: 'Internal Server Error' });
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[API Error]',
        expect.objectContaining({
          method: 'GET',
          path: '/api/error-test',
          error: 'Test error from handler',
          stack: expect.any(String),
        }),
      );
    });

    it('should handle non-Error objects thrown', async () => {
        const req = createMockRequest();
        const nonErrorHandler: ApiRouteHandler = async (_req) => {
            // eslint-disable-next-line no-throw-literal
            throw 'Just a string error';
        };
        const wrappedHandler = withErrorHandling(nonErrorHandler);
        const response = await wrappedHandler(req as any); // Cast to any
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: 'Internal Server Error' });
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[API Error]',
            expect.objectContaining({
                error: 'Unknown error', // or specific message for string
                stack: undefined,
            })
        );
    });
  });

  describe('withRequestLogging', () => {
    it('should log request and response details on success', async () => {
      const req = createMockRequest('/api/log-test', 'POST', {'user-agent': 'TestAgent/1.0'}, '123.0.0.1');
      const mockSuccessHandlerWithMockResponse: ApiRouteHandler = async (_req) => {
        return mockNextResponseJson({ message: 'Success' }, { status: 200 }) as any;
      };
      const wrappedHandler = withRequestLogging(mockSuccessHandlerWithMockResponse);
      const response = await wrappedHandler(req as any); // Cast to any

      expect(response.status).toBe(200);
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        '[API Request]',
        expect.objectContaining({
          method: 'POST',
          path: '/api/log-test',
          userAgent: 'TestAgent/1.0',
          ip: '123.0.0.1',
        }),
      );
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        2,
        '[API Response]',
        expect.objectContaining({
          method: 'POST',
          path: '/api/log-test',
          userAgent: 'TestAgent/1.0',
          ip: '123.0.0.1',
          status: 200,
          durationMs: expect.any(Number),
        }),
      );
    });

    it('should log request and error details if handler throws', async () => {
        const req = createMockRequest('/api/log-error', 'GET', {'user-agent': 'ErrorAgent/1.0'}, '127.0.0.1');
        const wrappedHandler = withRequestLogging(mockErrorHandler);

        await expect(wrappedHandler(req as any)).rejects.toThrow('Test error from handler'); // Cast to any

        expect(consoleLogSpy).toHaveBeenCalledTimes(1); // Only request log
        expect(consoleLogSpy).toHaveBeenCalledWith(
            '[API Request]',
            expect.objectContaining({
                method: 'GET',
                path: '/api/log-error',
                userAgent: 'ErrorAgent/1.0',
                ip: '127.0.0.1',
            })
        );
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Error log from within withRequestLogging
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[API Response - Unhandled Error]',
            expect.objectContaining({
                method: 'GET',
                path: '/api/log-error',
                userAgent: 'ErrorAgent/1.0',
                ip: '127.0.0.1',
                status: 500,
                durationMs: expect.any(Number),
                errorMessage: 'Test error from handler',
            })
        );
    });
  });

  describe('withAuth (Stub)', () => {
    it('should call the handler and log auth stub message', async () => {
      const req = createMockRequest();
      const mockSuccessHandlerWithMockResponse: ApiRouteHandler = async (_req) => {
        return mockNextResponseJson({ message: 'Success' }, { status: 200 }) as any;
      };
      const wrappedHandler = withAuth(mockSuccessHandlerWithMockResponse);
      const response = await wrappedHandler(req as any); // Cast to any

      expect(response.status).toBe(200);
      expect(consoleLogSpy).toHaveBeenCalledWith('[Auth Stub] Placeholder authentication check passed.');
    });
  });

  describe('composeWrappers', () => {
    it('should apply wrappers in the correct order (right-to-left)', async () => {
      const req = createMockRequest('/api/compose-test');
      const order: string[] = [];

      const wrapper1: (h: ApiRouteHandler) => ApiRouteHandler = (handler) => async (r, p) => {
        order.push('wrapper1_start');
        const res = await handler(r, p);
        order.push('wrapper1_end');
        return res;
      };
      const wrapper2: (h: ApiRouteHandler) => ApiRouteHandler = (handler) => async (r, p) => {
        order.push('wrapper2_start');
        const res = await handler(r, p);
        order.push('wrapper2_end');
        return res;
      };
      const baseHandler: ApiRouteHandler = async () => {
        order.push('handler');
        return mockNextResponseJson({ message: 'composed' }) as any;
      };

      const composed = composeWrappers(wrapper1, wrapper2)(baseHandler);
      await composed(req as any); // Cast to any

      expect(order).toEqual([
        'wrapper1_start',
        'wrapper2_start',
        'handler',
        'wrapper2_end',
        'wrapper1_end',
      ]);
    });

    it('integration of all wrappers: success flow', async () => {
        const req = createMockRequest('/api/full-compose-success');
        const composedHandler = composeWrappers(
            withErrorHandling,
            withRequestLogging,
            withAuth
        )(mockSuccessHandler); // Use the global mockSuccessHandler which now uses mockNextResponseJson

        const response = await composedHandler(req as any); // Cast to any
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ message: 'Success' });

        // Auth log
        expect(consoleLogSpy).toHaveBeenCalledWith('[Auth Stub] Placeholder authentication check passed.');
        // Request log
        expect(consoleLogSpy).toHaveBeenCalledWith(
            '[API Request]',
            expect.objectContaining({ path: '/api/full-compose-success' })
        );
        // Response log
        expect(consoleLogSpy).toHaveBeenCalledWith(
            '[API Response]',
            expect.objectContaining({ path: '/api/full-compose-success', status: 200 })
        );
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('integration of all wrappers: error flow', async () => {
        const req = createMockRequest('/api/full-compose-error');
        const composedHandler = composeWrappers(
            withErrorHandling,
            withRequestLogging,
            withAuth
        )(mockErrorHandler);

        const response = await composedHandler(req as any); // Cast to any
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: 'Internal Server Error' });

        // Auth log
        expect(consoleLogSpy).toHaveBeenCalledWith('[Auth Stub] Placeholder authentication check passed.');
        // Request log
        expect(consoleLogSpy).toHaveBeenCalledWith(
            '[API Request]',
            expect.objectContaining({ path: '/api/full-compose-error' })
        );
        // Error log from withRequestLogging (before re-throw)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[API Response - Unhandled Error]',
            expect.objectContaining({ path: '/api/full-compose-error', errorMessage: 'Test error from handler' })
        );
        // Error log from withErrorHandling (final catch)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[API Error]',
            expect.objectContaining({ path: '/api/full-compose-error', error: 'Test error from handler' })
        );
        // Ensure no success response log from withRequestLogging
        expect(consoleLogSpy).not.toHaveBeenCalledWith(
            '[API Response]',
            expect.objectContaining({ path: '/api/full-compose-error', status: 200 })
        );
    });
  });
});