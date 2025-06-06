/**
 * Tests for Join League Page
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import JoinLeaguePage from './page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth store
jest.mock('@/lib/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

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

describe('JoinLeaguePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
    // Mock auth store to return a valid token by default
    mockUseAuthStore.mockReturnValue('valid-test-token');
  });

  it('renders the join league form', () => {
    render(<JoinLeaguePage />);

    expect(screen.getByRole('heading', { name: 'Join League' })).toBeInTheDocument();
    expect(screen.getByText('Enter the League ID to join an existing fantasy football league')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter League ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join League' })).toBeInTheDocument();
  });

  it('shows authentication error when not logged in', async () => {
    // Mock auth store to return null token
    mockUseAuthStore.mockReturnValue(null);

    render(<JoinLeaguePage />);

    const submitButton = screen.getByRole('button', { name: 'Join League' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('You must be logged in to join a league')).toBeInTheDocument();
    });
  });

  it('shows validation error for empty league ID', async () => {
    render(<JoinLeaguePage />);

    const submitButton = screen.getByRole('button', { name: 'Join League' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a League ID')).toBeInTheDocument();
    });
  });

  it('successfully joins a league', async () => {
    const mockResponse = {
      message: 'Successfully joined league',
      league: {
        leagueId: 'league-123',
        leagueName: 'Test League',
        numberOfTeams: 10,
        currentTeamCount: 3
      },
      team: {
        teamId: 'team-456',
        teamName: "testuser's Team",
        userId: 'user-123'
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<JoinLeaguePage />);
    
    const leagueIdInput = screen.getByPlaceholderText('Enter League ID');
    const submitButton = screen.getByRole('button', { name: 'Join League' });
    
    fireEvent.change(leagueIdInput, { target: { value: 'league-123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Successfully joined "Test League"! Redirecting to your team...')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/leagues/league-123/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-test-token',
      },
    });

    // Wait for redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/league/league-123/roster');
    }, { timeout: 3000 });
  });

  it('shows error message when league is not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'League not found' }),
    });

    render(<JoinLeaguePage />);
    
    const leagueIdInput = screen.getByPlaceholderText('Enter League ID');
    const submitButton = screen.getByRole('button', { name: 'Join League' });
    
    fireEvent.change(leagueIdInput, { target: { value: 'nonexistent' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('League not found')).toBeInTheDocument();
    });
  });

  it('shows error message when league is full', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'League is full. No more teams can join.' }),
    });

    render(<JoinLeaguePage />);
    
    const leagueIdInput = screen.getByPlaceholderText('Enter League ID');
    const submitButton = screen.getByRole('button', { name: 'Join League' });
    
    fireEvent.change(leagueIdInput, { target: { value: 'full-league' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('League is full. No more teams can join.')).toBeInTheDocument();
    });
  });

  it('shows error message when user already in league', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'You are already a member of this league' }),
    });

    render(<JoinLeaguePage />);
    
    const leagueIdInput = screen.getByPlaceholderText('Enter League ID');
    const submitButton = screen.getByRole('button', { name: 'Join League' });
    
    fireEvent.change(leagueIdInput, { target: { value: 'existing-league' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('You are already a member of this league')).toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ message: 'Success' }),
      }), 100))
    );

    render(<JoinLeaguePage />);
    
    const leagueIdInput = screen.getByPlaceholderText('Enter League ID');
    const submitButton = screen.getByRole('button', { name: 'Join League' });
    
    fireEvent.change(leagueIdInput, { target: { value: 'league-123' } });
    fireEvent.click(submitButton);
    
    // Check that form is disabled during submission
    expect(screen.getByRole('button', { name: 'Joining League...' })).toBeInTheDocument();
    expect(leagueIdInput).toBeDisabled();
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<JoinLeaguePage />);
    
    const leagueIdInput = screen.getByPlaceholderText('Enter League ID');
    const submitButton = screen.getByRole('button', { name: 'Join League' });
    
    fireEvent.change(leagueIdInput, { target: { value: 'league-123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
