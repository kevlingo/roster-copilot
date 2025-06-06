/**
 * Integration tests for GET /api/players/[playerId] endpoint
 * Tests the full API flow with real database interactions
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/players/[playerId]/route';
import { initializeDatabase } from '@/lib/dal/db';
import { getAllNFLPlayers } from '@/lib/dal/player.dal';

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

// Mock only the auth session for integration tests
jest.mock('@/lib/auth/session', () => ({
  getUserFromSession: jest.fn().mockResolvedValue({
    userId: 'test-user-123',
    email: 'test@example.com',
    username: 'testuser'
  })
}));

describe('GET /api/players/[playerId] - Integration Tests', () => {
  let testPlayer: any = null;

  beforeAll(async () => {
    // Initialize database for integration tests
    await initializeDatabase();

    // Get an existing player from the database for testing
    const players = await getAllNFLPlayers();
    if (players.length > 0) {
      testPlayer = players[0]; // Use the first player for testing
    }
  });

  afterAll(async () => {
    // No cleanup needed since we're using existing data
  });

  it('should retrieve player data from database successfully', async () => {
    if (!testPlayer) {
      throw new Error('No test player available - database may be empty');
    }

    const request = new NextRequest(`http://localhost/api/players/${testPlayer.playerId}`);
    const params = { playerId: testPlayer.playerId };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.player).toMatchObject({
      playerId: testPlayer.playerId,
      fullName: testPlayer.fullName,
      position: testPlayer.position,
      nflTeamAbbreviation: testPlayer.nflTeamAbbreviation
    });
    // Don't check optional fields that might not exist in test data
  });

  it('should return 404 for non-existent player', async () => {
    const nonExistentPlayerId = 'non-existent-player-999';
    const request = new NextRequest(`http://localhost/api/players/${nonExistentPlayerId}`);
    const params = { playerId: nonExistentPlayerId };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Player not found');
  });

  it('should handle database connection gracefully', async () => {
    if (!testPlayer) {
      throw new Error('No test player available - database may be empty');
    }

    // Test with a valid request to ensure database connection works
    const request = new NextRequest(`http://localhost/api/players/${testPlayer.playerId}`);
    const params = { playerId: testPlayer.playerId };

    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    // If we get here, database connection is working properly
  });

  it('should validate playerId parameter correctly', async () => {
    const invalidPlayerIds = ['', ' ', '   ', null, undefined];

    for (const invalidId of invalidPlayerIds) {
      const request = new NextRequest(`http://localhost/api/players/${invalidId || ''}`);
      const params = { playerId: invalidId as string };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Player ID is required and must be a non-empty string');
    }
  });

  it('should return consistent data structure', async () => {
    if (!testPlayer) {
      throw new Error('No test player available - database may be empty');
    }

    const request = new NextRequest(`http://localhost/api/players/${testPlayer.playerId}`);
    const params = { playerId: testPlayer.playerId };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('player');
    expect(data.player).toHaveProperty('playerId');
    expect(data.player).toHaveProperty('fullName');
    expect(data.player).toHaveProperty('position');
    expect(data.player).toHaveProperty('nflTeamAbbreviation');
    expect(data.player).toHaveProperty('status');
    expect(data.player).toHaveProperty('projectedPoints');
    expect(data.player).toHaveProperty('keyAttributes');
    expect(data.player).toHaveProperty('notes');

    // Validate keyAttributes structure
    expect(data.player.keyAttributes).toHaveProperty('consistencyRating');
    expect(data.player.keyAttributes).toHaveProperty('upsidePotential');
    expect(data.player.keyAttributes).toHaveProperty('role');
  });

  it('should handle concurrent requests correctly', async () => {
    if (!testPlayer) {
      throw new Error('No test player available - database may be empty');
    }

    const request1 = new NextRequest(`http://localhost/api/players/${testPlayer.playerId}`);
    const request2 = new NextRequest(`http://localhost/api/players/${testPlayer.playerId}`);
    const params = { playerId: testPlayer.playerId };

    // Make concurrent requests
    const [response1, response2] = await Promise.all([
      GET(request1, { params }),
      GET(request2, { params })
    ]);

    const [data1, data2] = await Promise.all([
      response1.json(),
      response2.json()
    ]);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(data1.player).toEqual(data2.player);
  });
});
