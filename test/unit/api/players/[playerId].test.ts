/**
 * Unit tests for GET /api/players/[playerId] endpoint
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/players/[playerId]/route';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { getNFLPlayerById } from '@/lib/dal/player.dal';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.requireActual('next/server').NextRequest,
  NextResponse: {
    json: (data, init = {}) => ({
      status: init.status || 200,
      statusText: init.statusText || 'OK',
      headers: new Map(Object.entries(init.headers || {})),
      body: JSON.stringify(data),
      json: () => Promise.resolve(data)
    })
  }
}));

// Mock dependencies
jest.mock('@/lib/auth/session');
jest.mock('@/lib/dal/db');
jest.mock('@/lib/dal/player.dal');

const mockGetUserFromSession = getUserFromSession as jest.MockedFunction<typeof getUserFromSession>;
const mockInitializeDatabase = initializeDatabase as jest.MockedFunction<typeof initializeDatabase>;
const mockGetNFLPlayerById = getNFLPlayerById as jest.MockedFunction<typeof getNFLPlayerById>;

describe('GET /api/players/[playerId]', () => {
  const mockPlayer = {
    playerId: 'player123',
    fullName: 'Test Player',
    position: 'QB' as const,
    nflTeamAbbreviation: 'TEST',
    status: 'Active' as const,
    projectedPoints: 15.5,
    keyAttributes: {
      consistencyRating: 'High' as const,
      upsidePotential: 'Medium' as const,
      role: 'Starter'
    },
    notes: 'Test player notes'
  };

  const mockUser = {
    userId: 'user123',
    email: 'test@example.com',
    username: 'testuser'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockInitializeDatabase.mockResolvedValue(undefined);
    mockGetUserFromSession.mockResolvedValue(mockUser);
  });

  it('should return player data for valid request', async () => {
    mockGetNFLPlayerById.mockResolvedValue(mockPlayer);

    const request = new NextRequest('http://localhost/api/players/player123');
    const params = { playerId: 'player123' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.player).toEqual({
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
    });

    expect(mockInitializeDatabase).toHaveBeenCalled();
    expect(mockGetUserFromSession).toHaveBeenCalledWith(request);
    expect(mockGetNFLPlayerById).toHaveBeenCalledWith('player123');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockGetUserFromSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/players/player123');
    const params = { playerId: 'player123' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
    expect(mockGetNFLPlayerById).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid playerId', async () => {
    const request = new NextRequest('http://localhost/api/players/');
    const params = { playerId: '' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Player ID is required and must be a non-empty string');
    expect(mockGetNFLPlayerById).not.toHaveBeenCalled();
  });

  it('should return 404 when player is not found', async () => {
    mockGetNFLPlayerById.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/players/nonexistent');
    const params = { playerId: 'nonexistent' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Player not found');
    expect(mockGetNFLPlayerById).toHaveBeenCalledWith('nonexistent');
  });

  it('should return 500 when database error occurs', async () => {
    mockGetNFLPlayerById.mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost/api/players/player123');
    const params = { playerId: 'player123' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to retrieve player data');
  });

  it('should handle player with minimal data', async () => {
    const minimalPlayer = {
      playerId: 'player456',
      fullName: 'Minimal Player',
      position: 'RB' as const,
      nflTeamAbbreviation: 'MIN'
    };

    mockGetNFLPlayerById.mockResolvedValue(minimalPlayer);

    const request = new NextRequest('http://localhost/api/players/player456');
    const params = { playerId: 'player456' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.player).toEqual({
      playerId: 'player456',
      fullName: 'Minimal Player',
      position: 'RB',
      nflTeamAbbreviation: 'MIN',
      status: 'Active', // Default value
      projectedPoints: 0, // Default value
      keyAttributes: {
        consistencyRating: undefined,
        upsidePotential: undefined,
        role: undefined
      },
      notes: null
    });
  });

  it('should trim whitespace from playerId', async () => {
    mockGetNFLPlayerById.mockResolvedValue(mockPlayer);

    const request = new NextRequest('http://localhost/api/players/ player123 ');
    const params = { playerId: ' player123 ' };

    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(mockGetNFLPlayerById).toHaveBeenCalledWith('player123');
  });
});
