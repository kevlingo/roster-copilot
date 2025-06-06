/**
 * Individual Player API Routes
 * GET /api/players/[playerId] - Get detailed information for a specific NFL player
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { getNFLPlayerById } from '@/lib/dal/player.dal';

/**
 * GET /api/players/[playerId]
 * Gets detailed information for a specific NFL player by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
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

    const { playerId } = params;

    // Validate playerId parameter
    if (!playerId || typeof playerId !== 'string' || playerId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Player ID is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    try {
      // Get player from database
      const player = await getNFLPlayerById(playerId.trim());

      if (!player) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 }
        );
      }

      // Return the full player object with all details
      return NextResponse.json({
        player: {
          playerId: player.playerId,
          fullName: player.fullName,
          position: player.position,
          nflTeamAbbreviation: player.nflTeamAbbreviation,
          status: player.status || 'Active',
          projectedPoints: player.projectedPoints || 0,
          keyAttributes: player.keyAttributes || {
            consistencyRating: undefined,
            upsidePotential: undefined,
            role: undefined
          },
          notes: player.notes || null
        }
      });

    } catch (dbError) {
      console.error('[API Error] Database error while fetching player:', dbError);
      return NextResponse.json(
        { error: 'Failed to retrieve player data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Error] Failed to get NFL player details:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
