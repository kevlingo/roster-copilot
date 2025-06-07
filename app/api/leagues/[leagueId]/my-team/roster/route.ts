/**
 * Team Roster API Route
 * GET /api/leagues/[leagueId]/my-team/roster - Get current user's team roster for a league
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { 
  getLeagueById, 
  getFantasyTeamByUserAndLeague 
} from '@/lib/dal/league.dal';
import { getNFLPlayersByIds } from '@/lib/dal/player.dal';

/**
 * GET /api/leagues/[leagueId]/my-team/roster
 * Gets the current user's team roster for the specified league
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

    // Validate leagueId parameter
    if (!leagueId || typeof leagueId !== 'string') {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Get league details
    const league = await getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    // Get user's fantasy team for this league
    const fantasyTeam = await getFantasyTeamByUserAndLeague(user.userId, leagueId);
    if (!fantasyTeam) {
      return NextResponse.json(
        { error: 'You are not part of this league' },
        { status: 403 }
      );
    }

    // Get player details for all players on the roster
    const rosterPlayers = await getNFLPlayersByIds(fantasyTeam.playerIds_onRoster);

    // Group players by position for easier frontend consumption
    const playersByPosition = rosterPlayers.reduce((acc, player) => {
      if (!acc[player.position]) {
        acc[player.position] = [];
      }
      acc[player.position].push({
        playerId: player.playerId,
        fullName: player.fullName,
        position: player.position,
        nflTeamAbbreviation: player.nflTeamAbbreviation,
        status: player.status || 'Active',
        projectedPoints: player.projectedPoints || 0,
        // For Story 1.9, we don't have lineup data yet, so all players are considered "bench"
        // This will be updated in Story 1.10 when lineup functionality is implemented
        lineupStatus: 'bench' as const
      });
      return acc;
    }, {} as Record<string, Array<{
      playerId: string;
      fullName: string;
      position: string;
      nflTeamAbbreviation: string;
      status: string;
      projectedPoints: number;
      lineupStatus: 'starter' | 'bench';
    }>>);

    // Calculate roster slot counts based on league settings
    const rosterSettings = league.rosterSettings || {
      QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1, BENCH: 6
    };

    const rosterSlotCounts = Object.entries(rosterSettings).map(([position, required]) => {
      const currentCount = playersByPosition[position]?.length || 0;
      // For now, all players are on bench since we don't have lineup data
      const startersCount = 0; // Will be updated in Story 1.10
      
      return {
        position,
        required,
        current: currentCount,
        starters: startersCount,
        available: Math.max(0, required - startersCount)
      };
    });

    const response = {
      teamInfo: {
        teamId: fantasyTeam.teamId,
        teamName: fantasyTeam.teamName,
        leagueId: fantasyTeam.leagueId,
        leagueName: league.leagueName
      },
      rosterSettings,
      rosterSlotCounts,
      playersByPosition,
      totalPlayersOnRoster: rosterPlayers.length,
      currentSeasonWeek: league.currentSeasonWeek
    };

    console.log(`[API] Roster fetched successfully for user ${user.userId} in league ${leagueId}`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[API Error] Failed to get team roster:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
