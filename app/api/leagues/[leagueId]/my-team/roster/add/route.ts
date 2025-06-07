/**
 * Add Player to Roster API Route
 * POST /api/leagues/[leagueId]/my-team/roster/add - Add a player to user's team roster
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { 
  getLeagueById, 
  getFantasyTeamByUserAndLeague,
  addPlayerToTeamRoster,
  removePlayerFromTeamRoster,
  getOwnedPlayerIdsInLeague
} from '@/lib/dal/league.dal';
import { getNFLPlayerById } from '@/lib/dal/player.dal';
import { AddPlayerRequestDto, AddPlayerResponseDto, RosterErrorDto } from '@/lib/dtos/roster.dto';

/**
 * POST /api/leagues/[leagueId]/my-team/roster/add
 * Adds a player to the user's team roster, optionally dropping another player
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
    let body: AddPlayerRequestDto;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { playerIdToAdd, playerIdToDrop } = body;

    // Validate required fields
    if (!playerIdToAdd || typeof playerIdToAdd !== 'string') {
      return NextResponse.json(
        { error: 'playerIdToAdd is required and must be a string' },
        { status: 400 }
      );
    }

    if (playerIdToDrop && typeof playerIdToDrop !== 'string') {
      return NextResponse.json(
        { error: 'playerIdToDrop must be a string if provided' },
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

      // Verify player to add exists
      const playerToAdd = await getNFLPlayerById(playerIdToAdd);
      if (!playerToAdd) {
        const errorResponse: RosterErrorDto = {
          error: 'Player to add not found',
          code: 'PLAYER_NOT_FOUND'
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }

      // Check if player is already on user's roster
      if (fantasyTeam.playerIds_onRoster.includes(playerIdToAdd)) {
        const errorResponse: RosterErrorDto = {
          error: 'Player is already on your roster',
          code: 'PLAYER_ALREADY_OWNED'
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      // Check if player is available (not owned by any team in league)
      const ownedPlayerIds = await getOwnedPlayerIdsInLeague(leagueId);
      if (ownedPlayerIds.includes(playerIdToAdd)) {
        const errorResponse: RosterErrorDto = {
          error: 'Player is already owned by another team in this league',
          code: 'PLAYER_ALREADY_OWNED'
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      // Calculate total roster slots
      const rosterSettings = league.rosterSettings || {};
      const totalRosterSlots = Object.values(rosterSettings).reduce((sum: number, count: unknown) => sum + (count as number), 0);
      
      // Check roster space and validate drop player if needed
      let playerToDrop = null;
      const currentRosterSize = fantasyTeam.playerIds_onRoster.length;

      if (currentRosterSize >= totalRosterSlots) {
        // Roster is full, must drop a player
        if (!playerIdToDrop) {
          const errorResponse: RosterErrorDto = {
            error: 'Roster is full. You must specify a player to drop.',
            code: 'ROSTER_FULL'
          };
          return NextResponse.json(errorResponse, { status: 400 });
        }

        // Verify player to drop exists and is on user's roster
        if (!fantasyTeam.playerIds_onRoster.includes(playerIdToDrop)) {
          const errorResponse: RosterErrorDto = {
            error: 'Player to drop is not on your roster',
            code: 'PLAYER_NOT_ON_ROSTER'
          };
          return NextResponse.json(errorResponse, { status: 400 });
        }

        playerToDrop = await getNFLPlayerById(playerIdToDrop);
        if (!playerToDrop) {
          const errorResponse: RosterErrorDto = {
            error: 'Player to drop not found',
            code: 'PLAYER_NOT_FOUND'
          };
          return NextResponse.json(errorResponse, { status: 404 });
        }
      }

      // Perform the transaction
      if (playerToDrop && playerIdToDrop) {
        // Drop player first, then add new player
        await removePlayerFromTeamRoster(fantasyTeam.teamId, playerIdToDrop);
      }
      
      await addPlayerToTeamRoster(fantasyTeam.teamId, playerIdToAdd);

      // Prepare response
      const response: AddPlayerResponseDto = {
        success: true,
        message: playerToDrop 
          ? `Successfully added ${playerToAdd.fullName} and dropped ${playerToDrop.fullName}`
          : `Successfully added ${playerToAdd.fullName}`,
        transaction: {
          addedPlayer: {
            playerId: playerToAdd.playerId,
            fullName: playerToAdd.fullName,
            position: playerToAdd.position
          },
          ...(playerToDrop && {
            droppedPlayer: {
              playerId: playerToDrop.playerId,
              fullName: playerToDrop.fullName,
              position: playerToDrop.position
            }
          })
        },
        updatedRosterCount: playerToDrop ? currentRosterSize : currentRosterSize + 1
      };

      return NextResponse.json(response);

    } catch (dbError) {
      console.error('[API Error] Database error while adding player:', dbError);
      return NextResponse.json(
        { error: 'Failed to add player to roster' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Error] Failed to add player:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
