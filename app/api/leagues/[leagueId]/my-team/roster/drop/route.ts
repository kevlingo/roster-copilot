/**
 * Drop Player from Roster API Route
 * POST /api/leagues/[leagueId]/my-team/roster/drop - Drop a player from user's team roster
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { 
  getLeagueById, 
  getFantasyTeamByUserAndLeague,
  removePlayerFromTeamRoster
} from '@/lib/dal/league.dal';
import { getNFLPlayerById } from '@/lib/dal/player.dal';
import { DropPlayerRequestDto, DropPlayerResponseDto, RosterErrorDto } from '@/lib/dtos/roster.dto';

/**
 * POST /api/leagues/[leagueId]/my-team/roster/drop
 * Drops a player from the user's team roster
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
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

    const { leagueId } = await params;

    // Validate leagueId parameter
    if (!leagueId || typeof leagueId !== 'string') {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body: DropPlayerRequestDto;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { playerIdToDrop } = body;

    // Validate required fields
    if (!playerIdToDrop || typeof playerIdToDrop !== 'string') {
      return NextResponse.json(
        { error: 'playerIdToDrop is required and must be a string' },
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

      // Get user's team in this league
      const fantasyTeam = await getFantasyTeamByUserAndLeague(user.userId, leagueId);
      if (!fantasyTeam) {
        return NextResponse.json(
          { error: 'You do not have a team in this league' },
          { status: 403 }
        );
      }

      // Verify player to drop exists
      const playerToDrop = await getNFLPlayerById(playerIdToDrop);
      if (!playerToDrop) {
        const errorResponse: RosterErrorDto = {
          error: 'Player to drop not found',
          code: 'PLAYER_NOT_FOUND'
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }

      // Check if player is on user's roster
      if (!fantasyTeam.playerIds_onRoster.includes(playerIdToDrop)) {
        const errorResponse: RosterErrorDto = {
          error: 'Player is not on your roster',
          code: 'PLAYER_NOT_ON_ROSTER'
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      // Perform the drop operation
      await removePlayerFromTeamRoster(fantasyTeam.teamId, playerIdToDrop);

      // Prepare response
      const response: DropPlayerResponseDto = {
        success: true,
        message: `Successfully dropped ${playerToDrop.fullName}`,
        droppedPlayer: {
          playerId: playerToDrop.playerId,
          fullName: playerToDrop.fullName,
          position: playerToDrop.position
        },
        updatedRosterCount: fantasyTeam.playerIds_onRoster.length - 1
      };

      return NextResponse.json(response);

    } catch (dbError) {
      console.error('[API Error] Database error while dropping player:', dbError);
      return NextResponse.json(
        { error: 'Failed to drop player from roster' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Error] Failed to drop player:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
