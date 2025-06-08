import { useAuthStore } from '@/lib/store/auth.store';
import { UserProfile } from '@/lib/models/user.models';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should set user and token in store and sessionStorage', () => {
      const mockUser: UserProfile = {
        userId: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'test-token';

      const { login } = useAuthStore.getState();
      login(mockUser, mockToken);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
    });
  });

  describe('logout', () => {
    it('should clear user and token from store and sessionStorage', () => {
      // First login
      const mockUser: UserProfile = {
        userId: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const { login, logout } = useAuthStore.getState();
      login(mockUser, 'test-token');

      // Then logout
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('restoreAuth', () => {
    it('should restore auth state from sessionStorage when valid data exists', () => {
      const mockUser: UserProfile = {
        userId: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hash',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'test-token';

      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return mockToken;
        if (key === 'auth_user') return JSON.stringify(mockUser);
        return null;
      });

      const { restoreAuth } = useAuthStore.getState();
      restoreAuth();

      const state = useAuthStore.getState();
      // When JSON.parse is used, Date objects become strings, so we need to account for this
      const expectedUser = {
        ...mockUser,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      };
      expect(state.user).toEqual(expectedUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should not restore auth when no data in sessionStorage', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      const { restoreAuth } = useAuthStore.getState();
      restoreAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear invalid data when JSON parsing fails', () => {
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'test-token';
        if (key === 'auth_user') return 'invalid-json';
        return null;
      });

      const { restoreAuth } = useAuthStore.getState();
      restoreAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });
});
