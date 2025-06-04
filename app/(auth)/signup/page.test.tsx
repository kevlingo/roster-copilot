import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from './page'; // Adjust path if necessary
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })), // Mock useSearchParams as well
}));

// Mock fetch
global.fetch = jest.fn();

describe('SignupPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Registration successful!' }),
    });
  });

  it('renders the signup form correctly', () => {
    render(<SignupPage />);
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument(); // Exact match for "Password"
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /i agree to the terms of service and privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields on submit attempt', async () => {
    render(<SignupPage />);
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    expect(screen.getByText('You must agree to the terms')).toBeInTheDocument();
  });

  it('displays validation error for mismatched passwords', async () => {
    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password123@');
    await userEvent.click(screen.getByRole('checkbox')); // Agree to terms
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('displays validation error for invalid email format', async () => {
    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'invalidemail');
    fireEvent.blur(screen.getByLabelText(/email/i)); // Explicitly blur
    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
  });
  
  it('displays validation error for weak password', async () => {
    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText(/^password$/i), 'weak');
    fireEvent.blur(screen.getByLabelText(/^password$/i)); // Explicitly blur
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
    
    await userEvent.clear(screen.getByLabelText(/^password$/i));
    await userEvent.type(screen.getByLabelText(/^password$/i), 'weakpass'); // Still no special char/number/uppercase
    fireEvent.blur(screen.getByLabelText(/^password$/i)); // Explicitly blur
     // Wait for the specific error message related to pattern
    expect(await screen.findByText('Password must contain an uppercase, lowercase, number, and special character.')).toBeInTheDocument();
  });

  it('submits the form with valid data and shows success message', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'User registered successfully. Please check your email to verify your account.' }),
    });

    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'ValidPass123!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'ValidPass123!');
    await userEvent.click(screen.getByRole('checkbox'));

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'ValidPass123!',
          passwordConfirmation: 'ValidPass123!',
        }),
      });
    });
    
    expect(await screen.findByText('User registered successfully. Please check your email to verify your account.')).toBeInTheDocument();
    // Expect button to be disabled while loading
    // expect(screen.getByRole('button', { name: /creating account.../i })).toBeDisabled(); // This check is tricky with async updates
  });

  it('shows API error message on failed signup', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ errors: [{ property: 'username', message: 'Username already taken' }] }),
    });
    
    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText(/username/i), 'existinguser');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'ValidPass123!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'ValidPass123!');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText('Username already taken')).toBeInTheDocument();
  });

  it('shows generic API error if specific error message is not provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });
    
    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'ValidPass123!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'ValidPass123!');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText('Internal Server Error')).toBeInTheDocument();
  });

  it('shows network error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));
    
    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'ValidPass123!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'ValidPass123!');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText('Failed to connect to the server. Please try again.')).toBeInTheDocument();
  });
});