import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';
import { useAuthStore, AuthState } from '@/lib/store/auth.store';
import { UserProfile } from '@/lib/models/user.models';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the auth store actions
const mockLoginAction = jest.fn();
const mockLogoutAction = jest.fn();

const mockedUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

jest.mock('@/lib/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

global.fetch = jest.fn();

const mockUser: UserProfile = {
  userId: '123',
  username: 'testuser',
  email: 'test@example.com',
  emailVerified: true,
  passwordHash: '',
  selectedArchetype: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    (global.fetch as jest.Mock).mockClear();
    mockLoginAction.mockClear();

    mockedUseAuthStore.mockImplementation((selector: (state: AuthState) => any) => {
      const state: AuthState = {
        user: null,
        token: null,
        isAuthenticated: false,
        login: mockLoginAction,
        logout: mockLogoutAction,
      };
      return selector(state);
    });
  });

  it('renders the login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Login to your Account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Forgot password?/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  it('shows validation error if email is empty', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const loginButton = screen.getByRole('button', { name: /Login/i });
    await user.click(loginButton);
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email address is required.');
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows validation error if password is empty', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    const loginButton = screen.getByRole('button', { name: /Login/i });
    await user.click(loginButton);
    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required.');
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls login API, updates store, and redirects on successful login', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Login successful',
        user: mockUser,
        token: 'fake-jwt-token',
      }),
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'Password123!');
    const loginButton = screen.getByRole('button', { name: /Login/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
      });
    });
    
    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalledWith(mockUser, 'fake-jwt-token');
    });
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
    expect(screen.queryByText(/Login failed/i)).not.toBeInTheDocument();
  });

  it('shows API error message on failed login (e.g. invalid credentials)', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials.' }),
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'wrongpassword');
    const loginButton = screen.getByRole('button', { name: /Login/i });
    await user.click(loginButton);

    const alert = await screen.findByTestId('login-error-alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Invalid credentials.');
    expect(mockLoginAction).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows generic error message on network error', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<LoginPage />);
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'Password123!');
    const loginButton = screen.getByRole('button', { name: /Login/i });
    await user.click(loginButton);

    const alert = await screen.findByTestId('login-error-alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Login failed due to a network error. Please try again.');
    expect(mockLoginAction).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});