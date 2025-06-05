import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import MainLayout from './layout';
import { useAuthStore } from '@/lib/store/auth.store';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the auth store
jest.mock('@/lib/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

// Mock the components that aren't relevant to logout testing
jest.mock('@/components/core/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock('@/components/core/Header', () => {
  return function MockHeader({ username, onLogout }: { username: string; onLogout: () => void }) {
    return (
      <div data-testid="header">
        <span data-testid="username">{username}</span>
        <button data-testid="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    );
  };
});

jest.mock('@/components/ai-chat/PersistentChatInterface', () => {
  return function MockPersistentChatInterface() {
    return <div data-testid="chat-interface">Chat Interface</div>;
  };
});

jest.mock('@/src/hooks/useAINotification', () => ({
  useAINotification: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showInfo: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('MainLayout Logout Functionality', () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as ReturnType<typeof useRouter>);

    mockUseAuthStore.mockReturnValue({
      logout: mockLogout,
      user: { username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true,
      token: 'test-token',
      login: jest.fn(),
      restoreAuth: jest.fn(),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Logout successful' }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should display the username from auth store', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    const usernameElements = screen.getAllByTestId('username');
    expect(usernameElements[0]).toHaveTextContent('testuser');
  });

  it('should show authentication loading when user is not logged in', () => {
    mockUseAuthStore.mockReturnValue({
      logout: mockLogout,
      user: null,
      isAuthenticated: false,
      token: null,
      login: jest.fn(),
      restoreAuth: jest.fn(),
    });

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Should show authentication loading screen instead of main content
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.queryByTestId('username')).not.toBeInTheDocument();
  });

  it('should handle successful logout', async () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    const logoutButtons = screen.getAllByTestId('logout-button');
    fireEvent.click(logoutButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should handle logout when API call fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    const logoutButtons = screen.getAllByTestId('logout-button');
    fireEvent.click(logoutButtons[0]);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle logout when network error occurs', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    const logoutButtons = screen.getAllByTestId('logout-button');
    fireEvent.click(logoutButtons[0]);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
