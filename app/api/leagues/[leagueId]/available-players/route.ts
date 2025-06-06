/**
 * Available Players API Route
 * GET /api/leagues/[leagueId]/available-players - Get available (unowned) players for a league
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { getLeagueById, getOwnedPlayerIdsInLeague } from '@/lib/dal/league.dal';
import { getAvailableNFLPlayersInLeague } from '@/lib/dal/player.dal';
import { GetAvailablePlayersResponseDto } from '@/lib/dtos/roster.dto';

/**
 * GET /api/leagues/[leagueId]/available-players
 * Gets available (unowned) players for the specified league
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
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

    const { leagueId } = params;

    // Validate leagueId parameter
    if (!leagueId || typeof leagueId !== 'string') {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const search = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    
    // Validate and parse limit
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

    try {
      // Verify league exists
      const league = await getLeagueById(leagueId);
      if (!league) {
        return NextResponse.json(
          { error: 'League not found' },
          { status: 404 }
        );
      }

      // Get all owned player IDs in this league
      const ownedPlayerIds = await getOwnedPlayerIdsInLeague(leagueId);

      // Get available players
      let availablePlayers = await getAvailableNFLPlayersInLeague(
        ownedPlayerIds,
        position as "QB" | "RB" | "WR" | "TE" | "K" | "DEF" | undefined,
        search || undefined
      );

      // Apply limit if specified
      if (limit && availablePlayers.length > limit) {
        availablePlayers = availablePlayers.slice(0, limit);
      }

      // Transform to API response format
      const responseData: GetAvailablePlayersResponseDto = {
        players: availablePlayers.map(player => ({
          playerId: player.playerId,
          fullName: player.fullName,
          position: player.position,
          nflTeamAbbreviation: player.nflTeamAbbreviation,
          status: player.status || 'Active',
          projectedPoints: player.projectedPoints || 0
        })),
        total: availablePlayers.length,
        filters: {
          position: position || null,
          search: search || null,
          limit: limit || null
        }
      };

      return NextResponse.json(responseData);

    } catch (dbError) {
      console.error('[API Error] Database error while fetching available players:', dbError);
      return NextResponse.json(
        { error: 'Failed to retrieve available players' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Error] Failed to get available players:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
