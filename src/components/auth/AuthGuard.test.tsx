import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import AuthGuard from './AuthGuard';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth store
jest.mock('@/lib/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('shows loading state initially', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      restoreAuth: jest.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      restoreAuth: jest.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('renders children when user is authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      token: 'valid-token',
      user: { username: 'testuser', email: 'test@example.com' },
      login: jest.fn(),
      logout: jest.fn(),
      restoreAuth: jest.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('calls restoreAuth on mount', () => {
    const mockRestoreAuth = jest.fn();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      token: 'valid-token',
      user: { username: 'testuser', email: 'test@example.com' },
      login: jest.fn(),
      logout: jest.fn(),
      restoreAuth: mockRestoreAuth,
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(mockRestoreAuth).toHaveBeenCalledTimes(1);
  });

  it('renders custom fallback when provided', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      restoreAuth: jest.fn(),
    });

    const customFallback = <div>Custom Loading...</div>;

    render(
      <AuthGuard fallback={customFallback}>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument();
  });
});
