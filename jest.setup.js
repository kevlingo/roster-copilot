// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js Request/Response globals for Jest environment
if (typeof global.Request === 'undefined') {
  global.Request = class MockRequest {
    constructor(input, init = {}) {
      // Use defineProperty to avoid readonly conflicts
      Object.defineProperty(this, 'url', {
        value: typeof input === 'string' ? input : input?.url || '',
        writable: false,
        enumerable: true
      });
      Object.defineProperty(this, 'method', {
        value: init.method || 'GET',
        writable: false,
        enumerable: true
      });
      this.headers = new Map(Object.entries(init.headers || {}));
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class MockResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Map(Object.entries(init.headers || {}));
    }

    json() {
      return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body);
    }

    // Static method for NextResponse.json compatibility
    static json(data, init = {}) {
      return new this(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers
        }
      });
    }
  };
}



// Only set up window mocks if we're in a JSDOM environment (window exists)
if (typeof window !== 'undefined') {
  // Mock window.matchMedia for tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock localStorage for tests
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
}