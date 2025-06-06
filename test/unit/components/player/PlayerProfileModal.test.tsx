/**
 * Unit tests for PlayerProfileModal component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerProfileModal from '@/src/components/player/PlayerProfileModal';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('PlayerProfileModal', () => {
  const mockPlayer = {
    playerId: 'player123',
    fullName: 'Test Player',
    position: 'QB',
    nflTeamAbbreviation: 'TEST',
    status: 'Active',
    projectedPoints: 15.5,
    keyAttributes: {
      consistencyRating: 'High',
      upsidePotential: 'Medium',
      role: 'Starter'
    },
    notes: 'Test player notes'
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    playerId: 'player123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  it('should not render when isOpen is false', () => {
    render(
      <PlayerProfileModal
        {...defaultProps}
        isOpen={false}
      />
    );

    expect(screen.queryByText('Player Profile')).not.toBeInTheDocument();
  });

  it('should show loading state when fetching player data', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<PlayerProfileModal {...defaultProps} />);

    expect(screen.getByText('Loading player details...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('should display player data when fetch is successful', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ player: mockPlayer }),
    } as Response);

    render(<PlayerProfileModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    expect(screen.getByText('QB')).toBeInTheDocument();
    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('15.5')).toBeInTheDocument();
    expect(screen.getByText('Projected Points')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument(); // Consistency rating
    expect(screen.getByText('Medium')).toBeInTheDocument(); // Upside potential
    expect(screen.getByText('Starter')).toBeInTheDocument(); // Role
    expect(screen.getByText('Test player notes')).toBeInTheDocument();
  });

  it('should display error when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<PlayerProfileModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load player data')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should display authentication error when token is missing', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(<PlayerProfileModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Authentication required')).toBeInTheDocument();
    });
  });

  it('should display 404 error when player is not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    render(<PlayerProfileModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Player not found')).toBeInTheDocument();
    });
  });

  it('should call onClose when close button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ player: mockPlayer }),
    } as Response);

    render(<PlayerProfileModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should retry fetch when Try Again button is clicked', async () => {
    // First call fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<PlayerProfileModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load player data')).toBeInTheDocument();
    });

    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ player: mockPlayer }),
    } as Response);

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should handle player with minimal data', async () => {
    const minimalPlayer = {
      playerId: 'player456',
      fullName: 'Minimal Player',
      position: 'RB',
      nflTeamAbbreviation: 'MIN'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ player: minimalPlayer }),
    } as Response);

    render(<PlayerProfileModal {...defaultProps} playerId="player456" />);

    await waitFor(() => {
      expect(screen.getByText('Minimal Player')).toBeInTheDocument();
    });

    expect(screen.getByText('RB')).toBeInTheDocument();
    expect(screen.getByText('MIN')).toBeInTheDocument();
    expect(screen.getByText('0.0')).toBeInTheDocument(); // Default projected points
    expect(screen.getAllByText('N/A')).toHaveLength(3); // Consistency, upside, role
  });

  it('should not fetch data when playerId is null', () => {
    render(
      <PlayerProfileModal
        {...defaultProps}
        playerId={null}
      />
    );

    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.getByText('No player data available')).toBeInTheDocument();
  });

  it('should reset state when modal closes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ player: mockPlayer }),
    } as Response);

    const { rerender } = render(<PlayerProfileModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    // Close modal
    rerender(
      <PlayerProfileModal
        {...defaultProps}
        isOpen={false}
      />
    );

    // Reopen modal
    rerender(<PlayerProfileModal {...defaultProps} />);

    // Should show loading state again
    expect(screen.getByText('Loading player details...')).toBeInTheDocument();
  });

  it('should render status badges correctly', async () => {
    const playerWithDifferentStatus = {
      ...mockPlayer,
      status: 'Injured_Out'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ player: playerWithDifferentStatus }),
    } as Response);

    render(<PlayerProfileModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('OUT')).toBeInTheDocument();
    });
  });
});
