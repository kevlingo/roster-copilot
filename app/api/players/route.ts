/**
 * Players API Routes
 * GET /api/players - Get NFL players with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { 
  getAllNFLPlayers, 
  getNFLPlayersByPosition, 
  searchNFLPlayersByName 
} from '@/lib/dal/player.dal';

/**
 * GET /api/players
 * Gets NFL players with optional filtering by position or search term
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const search = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    
    // Validate limit parameter
    let limit: number | undefined;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
        return NextResponse.json(
          { error: 'Limit must be a number between 1 and 500' },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    // Validate position parameter
    const validPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    if (position && !validPositions.includes(position)) {
      return NextResponse.json(
        { error: `Invalid position. Must be one of: ${validPositions.join(', ')}` },
        { status: 400 }
      );
    }

    let players;

    try {
      // Get players based on filters
      if (search && search.trim().length > 0) {
        // Search by name takes precedence
        players = await searchNFLPlayersByName(search.trim());
      } else if (position) {
        // Filter by position
        players = await getNFLPlayersByPosition(position as "QB" | "RB" | "WR" | "TE" | "K" | "DEF");
      } else {
        // Get all players
        players = await getAllNFLPlayers();
      }

      // Apply limit if specified
      if (limit && players.length > limit) {
        players = players.slice(0, limit);
      }

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
        filters: {
          position: position || null,
          search: search || null,
          limit: limit || null
        }
      };

      return NextResponse.json(responseData);

    } catch (dbError) {
      console.error('[API Error] Database error while fetching players:', dbError);
      return NextResponse.json(
        { error: 'Failed to retrieve player data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Error] Failed to get NFL players:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
