/**
 * Batch Players API Route
 * POST /api/players/batch - Get multiple NFL players by their IDs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { getNFLPlayersByIds } from '@/lib/dal/player.dal';

interface BatchPlayersRequest {
  playerIds: string[];
}

/**
 * POST /api/players/batch
 * Gets multiple NFL players by their IDs
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Check authentication
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: BatchPlayersRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate playerIds
    const { playerIds } = body;
    
    if (!Array.isArray(playerIds)) {
      return NextResponse.json(
        { error: 'playerIds must be an array' },
        { status: 400 }
      );
    }

    if (playerIds.length === 0) {
      return NextResponse.json({
        players: [],
        total: 0,
        requested: 0
      });
    }

    if (playerIds.length > 100) {
      return NextResponse.json(
        { error: 'Cannot request more than 100 players at once' },
        { status: 400 }
      );
    }

    // Validate that all playerIds are strings
    const invalidIds = playerIds.filter(id => typeof id !== 'string' || id.trim().length === 0);
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: 'All player IDs must be non-empty strings' },
        { status: 400 }
      );
    }

    // Remove duplicates and trim
    const uniquePlayerIds = [...new Set(playerIds.map(id => id.trim()))];

    try {
      // Get players from database
      const players = await getNFLPlayersByIds(uniquePlayerIds);

      // Transform to API response format
      const responseData = {
        players: players.map(player => ({
          playerId: player.playerId,
          fullName: player.fullName,
          position: player.position,
          nflTeamAbbreviation: player.nflTeamAbbreviation,
          status: player.status || 'Active',
          projectedPoints: player.projectedPoints || 0
        })),
        total: players.length,
        requested: uniquePlayerIds.length,
        notFound: uniquePlayerIds.filter(id => 
          !players.some(player => player.playerId === id)
        )
      };

      return NextResponse.json(responseData);

    } catch (dbError) {
      console.error('[API Error] Database error while fetching players by IDs:', dbError);
      return NextResponse.json(
        { error: 'Failed to retrieve player data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Error] Failed to get NFL players by IDs:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
