/**
 * Weekly Lineup API Routes
 * GET /api/leagues/[leagueId]/my-team/lineup?week=[weekNumber] - Get current lineup for a team for a specific week
 * POST /api/leagues/[leagueId]/my-team/lineup - Save/update lineup for a team for a specific week
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { getLeagueById, getFantasyTeamByUserAndLeague, getWeeklyLineup, saveWeeklyLineup } from '@/lib/dal/league.dal';
import { getNFLPlayersByIds } from '@/lib/dal/player.dal';
import { 
  GetLineupResponseDto, 
  SaveLineupRequestDto, 
  SaveLineupResponseDto,
  LineupPlayerDto,
  LineupValidationResult,
  LineupValidationError
} from '@/lib/dtos/lineup.dto';

/**
 * GET /api/leagues/[leagueId]/my-team/lineup?week=[weekNumber]
 * Gets the current lineup for a team for a specific week
 */
export async function GET(
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
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');
    
    if (!weekParam) {
      return NextResponse.json(
        { error: 'Week parameter is required' },
        { status: 400 }
      );
    }

    const weekNumber = parseInt(weekParam, 10);
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 18) {
      return NextResponse.json(
        { error: 'Week must be a number between 1 and 18' },
        { status: 400 }
      );
    }

    // Get league
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
        { error: 'You are not a member of this league' },
        { status: 403 }
      );
    }

    // Get existing lineup for this week (if any)
    const existingLineup = await getWeeklyLineup(fantasyTeam.teamId, weekNumber);
    
    // Get all players on roster
    const rosterPlayers = await getNFLPlayersByIds(fantasyTeam.playerIds_onRoster);
    
    // Convert players to DTO format
    const playerDtos: LineupPlayerDto[] = rosterPlayers.map(player => ({
      playerId: player.playerId,
      fullName: player.fullName,
      position: player.position,
      nflTeamAbbreviation: player.nflTeamAbbreviation,
      status: player.status || 'Active',
      projectedPoints: player.projectedPoints || 0,
      // TODO: Add opponent and game time from NFLGame data
    }));

    let starters: LineupPlayerDto[] = [];
    let bench: LineupPlayerDto[] = [];

    if (existingLineup) {
      // Use existing lineup
      starters = playerDtos.filter(p => existingLineup.starterPlayerIds.includes(p.playerId));
      bench = playerDtos.filter(p => existingLineup.benchPlayerIds.includes(p.playerId));
    } else {
      // No existing lineup - all players on bench by default
      bench = playerDtos;
    }

    const response: GetLineupResponseDto = {
      teamInfo: {
        teamId: fantasyTeam.teamId,
        teamName: fantasyTeam.teamName,
        leagueId: fantasyTeam.leagueId,
        leagueName: league.leagueName
      },
      weekNumber,
      lineup: {
        starters,
        bench
      },
      rosterSettings: league.rosterSettings || {
        QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1, BENCH: 6
      },
      hasExistingLineup: !!existingLineup
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[API Error] Failed to get lineup:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leagues/[leagueId]/my-team/lineup
 * Saves/updates lineup for a team for a specific week
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

    // Parse request body
    let body: SaveLineupRequestDto;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { weekNumber, starterPlayerIds, benchPlayerIds } = body;

    if (!weekNumber || typeof weekNumber !== 'number' || weekNumber < 1 || weekNumber > 18) {
      return NextResponse.json(
        { error: 'Week number must be between 1 and 18' },
        { status: 400 }
      );
    }

    if (!Array.isArray(starterPlayerIds) || !Array.isArray(benchPlayerIds)) {
      return NextResponse.json(
        { error: 'starterPlayerIds and benchPlayerIds must be arrays' },
        { status: 400 }
      );
    }

    // Get league
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
        { error: 'You are not a member of this league' },
        { status: 403 }
      );
    }

    // Validate lineup
    const validationResult = await validateLineup(
      starterPlayerIds,
      benchPlayerIds,
      fantasyTeam.playerIds_onRoster,
      league.rosterSettings || { QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1, BENCH: 6 }
    );

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid lineup',
          validationErrors: validationResult.errors
        },
        { status: 400 }
      );
    }

    // Save lineup
    const savedLineup = await saveWeeklyLineup(
      fantasyTeam.teamId,
      leagueId,
      weekNumber,
      starterPlayerIds,
      benchPlayerIds
    );

    const response: SaveLineupResponseDto = {
      success: true,
      message: 'Lineup saved successfully!',
      lineup: {
        lineupId: savedLineup.lineupId,
        weekNumber: savedLineup.weekNumber,
        starterPlayerIds: savedLineup.starterPlayerIds,
        benchPlayerIds: savedLineup.benchPlayerIds,
        updatedAt: savedLineup.updatedAt
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[API Error] Failed to save lineup:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * Validates a lineup against league roster settings and player statuses
 */
async function validateLineup(
  starterPlayerIds: string[],
  benchPlayerIds: string[],
  rosterPlayerIds: string[],
  rosterSettings: { QB: number; RB: number; WR: number; TE: number; K: number; DEF: number; BENCH: number }
): Promise<LineupValidationResult> {
  const errors: LineupValidationError[] = [];

  // Check that all players are on the roster
  const allLineupPlayerIds = [...starterPlayerIds, ...benchPlayerIds];
  for (const playerId of allLineupPlayerIds) {
    if (!rosterPlayerIds.includes(playerId)) {
      errors.push({
        field: 'lineup',
        message: `Player ${playerId} is not on your roster`,
        playerId
      });
    }
  }

  // Check for duplicate players
  const duplicates = allLineupPlayerIds.filter((id, index) => allLineupPlayerIds.indexOf(id) !== index);
  for (const playerId of duplicates) {
    errors.push({
      field: 'lineup',
      message: `Player ${playerId} appears multiple times in lineup`,
      playerId
    });
  }

  // Check that all roster players are accounted for
  for (const playerId of rosterPlayerIds) {
    if (!allLineupPlayerIds.includes(playerId)) {
      errors.push({
        field: 'lineup',
        message: `Player ${playerId} must be assigned to either starters or bench`,
        playerId
      });
    }
  }

  // Get player details for position validation
  const starterPlayers = await getNFLPlayersByIds(starterPlayerIds);

  // Count positions in starting lineup
  const positionCounts: Record<string, number> = {};
  for (const player of starterPlayers) {
    positionCounts[player.position] = (positionCounts[player.position] || 0) + 1;
  }

  // Validate position requirements
  const requiredPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  for (const position of requiredPositions) {
    const required = rosterSettings[position as keyof typeof rosterSettings];
    const current = positionCounts[position] || 0;

    if (current !== required) {
      errors.push({
        field: 'starters',
        message: `${position}: Expected ${required}, got ${current}`
      });
    }
  }

  // Check for injured/bye week players in starting lineup
  for (const player of starterPlayers) {
    if (player.status === 'Injured_Out') {
      errors.push({
        field: 'starters',
        message: `${player.fullName} is injured and cannot be in starting lineup`,
        playerId: player.playerId
      });
    }

    if (player.status === 'Bye Week') {
      errors.push({
        field: 'starters',
        message: `${player.fullName} is on bye week and cannot be in starting lineup`,
        playerId: player.playerId
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
