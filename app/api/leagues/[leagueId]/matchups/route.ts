/**
 * Fantasy Matchups API Routes
 * GET /api/leagues/[leagueId]/matchups?week=[weekNumber] - Get NFL scoreboard and fantasy matchup for a specific week
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { getLeagueById, getFantasyTeamByUserAndLeague } from '@/lib/dal/league.dal';
import { getNFLGamesByWeek } from '@/lib/dal/game.dal';
import { createFantasyMatchup } from '@/lib/services/matchup.service';
import { 
  GetMatchupsResponseDto, 
  MatchupErrorResponseDto,
  NFLGameDto
} from '@/lib/dtos/matchup.dto';

/**
 * GET /api/leagues/[leagueId]/matchups?week=[weekNumber]
 * Gets NFL scoreboard and fantasy matchup data for a specific week
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
        { error: 'Authentication required' } as MatchupErrorResponseDto,
        { status: 401 }
      );
    }

    const { leagueId } = await params;
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');
    
    if (!weekParam) {
      return NextResponse.json(
        { error: 'Week parameter is required' } as MatchupErrorResponseDto,
        { status: 400 }
      );
    }

    const weekNumber = parseInt(weekParam, 10);
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 18) {
      return NextResponse.json(
        { error: 'Week must be a number between 1 and 18' } as MatchupErrorResponseDto,
        { status: 400 }
      );
    }

    // Get league
    const league = await getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' } as MatchupErrorResponseDto,
        { status: 404 }
      );
    }

    // Get user's team in this league
    const fantasyTeam = await getFantasyTeamByUserAndLeague(user.userId, leagueId);
    if (!fantasyTeam) {
      return NextResponse.json(
        { error: 'You are not a member of this league' } as MatchupErrorResponseDto,
        { status: 403 }
      );
    }

    // Get NFL games for the week
    const nflGames = await getNFLGamesByWeek(weekNumber);
    const nflScoreboard: NFLGameDto[] = nflGames.map(game => ({
      gameId: game.gameId,
      weekNumber: game.weekNumber,
      homeTeamAbbreviation: game.homeTeamAbbreviation,
      awayTeamAbbreviation: game.awayTeamAbbreviation,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      gameStatus: game.gameStatus,
      gameDateTime_ISO: game.gameDateTime_ISO
    }));

    // Get fantasy matchup
    let fantasyMatchup;
    try {
      fantasyMatchup = await createFantasyMatchup(fantasyTeam.teamId, leagueId, weekNumber);
    } catch (error) {
      console.error('[API Error] Failed to create fantasy matchup:', error);
      return NextResponse.json(
        { 
          error: 'Unable to determine fantasy matchup', 
          details: error instanceof Error ? error.message : 'Unknown error'
        } as MatchupErrorResponseDto,
        { status: 400 }
      );
    }

    const response: GetMatchupsResponseDto = {
      leagueInfo: {
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        currentSeasonWeek: league.currentSeasonWeek
      },
      weekNumber,
      nflScoreboard,
      fantasyMatchup,
      isPoC: true
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[API Error] Failed to get matchups:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as MatchupErrorResponseDto,
      { status: 500 }
    );
  }
}
