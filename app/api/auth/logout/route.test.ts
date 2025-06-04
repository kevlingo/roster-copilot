import { POST as logoutRouteHandler } from './route';
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

// Mock console.log to avoid noise in tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('/api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
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

  it('should return success response for logout request', async () => {
    const mockRequest = createMockRequest({
      'user-agent': 'Mozilla/5.0 Test Browser',
      'x-forwarded-for': '192.168.1.1',
    });

    const response = await logoutRouteHandler(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.message).toBe('Logout successful');
    expect(responseData.timestamp).toBeDefined();
    expect(new Date(responseData.timestamp)).toBeInstanceOf(Date);
  });

  it('should log logout event with request details', async () => {
    const mockRequest = createMockRequest({
      'user-agent': 'Mozilla/5.0 Test Browser',
      'x-forwarded-for': '192.168.1.1',
    });

    await logoutRouteHandler(mockRequest);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Auth] User logout initiated',
      expect.objectContaining({
        timestamp: expect.any(String),
        userAgent: 'Mozilla/5.0 Test Browser',
        ip: '192.168.1.1',
      })
    );
  });

  it('should handle missing headers gracefully', async () => {
    const mockRequest = createMockRequest();

    const response = await logoutRouteHandler(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.message).toBe('Logout successful');

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Auth] User logout initiated',
      expect.objectContaining({
        timestamp: expect.any(String),
        userAgent: null,
        ip: 'unknown',
      })
    );
  });

  it('should handle x-real-ip header when x-forwarded-for is not present', async () => {
    const mockRequest = createMockRequest({
      'x-real-ip': '10.0.0.1',
    });

    await logoutRouteHandler(mockRequest);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Auth] User logout initiated',
      expect.objectContaining({
        ip: '10.0.0.1',
      })
    );
  });

  it('should prefer x-forwarded-for over x-real-ip when both are present', async () => {
    const mockRequest = createMockRequest({
      'x-forwarded-for': '192.168.1.1',
      'x-real-ip': '10.0.0.1',
    });

    await logoutRouteHandler(mockRequest);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Auth] User logout initiated',
      expect.objectContaining({
        ip: '192.168.1.1',
      })
    );
  });
});
