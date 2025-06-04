import { NextRequest } from 'next/server';

// Mock next/server
jest.mock('next/server', () => {
  class MockNextRequest {
    headers: Headers;
    nextUrl: URL;
    method: string;

    constructor(input: string | URL | RequestInfo, init?: RequestInit) {
      const url = typeof input === 'string' ? input : (input as URL).toString();
      this.nextUrl = new URL(url);
      this.headers = new Headers(init?.headers);
      this.method = init?.method || 'GET';
    }
  }

  return {
    NextResponse: {
      json: jest.fn((body, init) => ({
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body)),
        body: body,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
      })),
    },
    NextRequest: MockNextRequest,
  };
});

import { POST as logoutHandler } from '../../../app/api/auth/logout/route';

describe('Logout Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (headers: Record<string, string> = {}) => {
    return {
      method: 'POST',
      headers: {
        get: jest.fn((name: string) => headers[name] || null),
      },
      nextUrl: {
        pathname: '/api/auth/logout',
      },
    } as unknown as NextRequest;
  };

  it('should complete full logout flow successfully', async () => {
    // Mock console.log to capture logout event
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Create a mock request with typical headers
    const mockRequest = createMockRequest({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'x-forwarded-for': '192.168.1.100',
    });

    // Call the logout API endpoint
    const response = await logoutHandler(mockRequest);
    const responseData = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(responseData.message).toBe('Logout successful');
    expect(responseData.timestamp).toBeDefined();
    expect(new Date(responseData.timestamp)).toBeInstanceOf(Date);

    // Verify that the logout event was logged
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Auth] User logout initiated',
      expect.objectContaining({
        timestamp: expect.any(String),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip: '192.168.1.100',
      })
    );

    // Verify the timestamp is recent (within last 5 seconds)
    const responseTime = new Date(responseData.timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - responseTime.getTime();
    expect(timeDiff).toBeLessThan(5000); // Less than 5 seconds

    mockConsoleLog.mockRestore();
  });

  it('should handle logout with missing headers gracefully', async () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    const mockRequest = createMockRequest();

    const response = await logoutHandler(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.message).toBe('Logout successful');

    // Verify that logout was logged with unknown IP
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Auth] User logout initiated',
      expect.objectContaining({
        timestamp: expect.any(String),
        userAgent: null,
        ip: 'unknown',
      })
    );

    mockConsoleLog.mockRestore();
  });

  it('should handle multiple concurrent logout requests', async () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Create multiple concurrent logout requests
    const requests = Array.from({ length: 3 }, (_, i) =>
      createMockRequest({
        'user-agent': `Test-Agent-${i}`,
        'x-forwarded-for': `192.168.1.${100 + i}`,
      })
    );

    // Execute all requests concurrently
    const responses = await Promise.all(
      requests.map(request => logoutHandler(request))
    );

    // Verify all responses are successful
    for (const response of responses) {
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Logout successful');
      expect(data.timestamp).toBeDefined();
    }

    // Verify that logout events were logged (middleware also logs, so we check for at least 3 auth logs)
    const authLogCalls = mockConsoleLog.mock.calls.filter(call =>
      call[0] === '[Auth] User logout initiated'
    );
    expect(authLogCalls).toHaveLength(3);

    mockConsoleLog.mockRestore();
  });

  it('should maintain consistent response format', async () => {
    const mockRequest = createMockRequest({
      'user-agent': 'Test-Agent',
      'x-forwarded-for': '10.0.0.1',
    });

    const response = await logoutHandler(mockRequest);
    const responseData = await response.json();

    // Verify response structure
    expect(responseData).toHaveProperty('message');
    expect(responseData).toHaveProperty('timestamp');
    expect(Object.keys(responseData)).toHaveLength(2);

    // Verify data types
    expect(typeof responseData.message).toBe('string');
    expect(typeof responseData.timestamp).toBe('string');

    // Verify timestamp format (ISO 8601)
    expect(responseData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
