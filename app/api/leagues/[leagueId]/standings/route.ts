/**
 * League Standings API Routes
 * GET /api/leagues/[leagueId]/standings - Get league standings with team records
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { getLeagueById } from '@/lib/dal/league.dal';
import { calculateLeagueStandings } from '@/lib/services/matchup.service';
import { 
  GetStandingsResponseDto, 
  StandingsErrorResponseDto,
  TeamStandingDto
} from '@/lib/dtos/standings.dto';

/**
 * GET /api/leagues/[leagueId]/standings
 * Gets league standings with win-loss records and points
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
        { error: 'Authentication required' } as StandingsErrorResponseDto,
        { status: 401 }
      );
    }

    const { leagueId } = await params;
    
    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' } as StandingsErrorResponseDto,
        { status: 400 }
      );
    }

    // Get league information
    const league = await getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' } as StandingsErrorResponseDto,
        { status: 404 }
      );
    }

    // Calculate standings
    const standings = await calculateLeagueStandings(leagueId, league);
    
    // Convert to DTOs with rank
    const standingDtos: TeamStandingDto[] = standings.map((standing, index) => ({
      teamId: standing.teamId,
      teamName: standing.teamName,
      userId: standing.userId,
      wins: standing.wins,
      losses: standing.losses,
      ties: standing.ties,
      pointsFor: Math.round(standing.pointsFor * 10) / 10, // Round to 1 decimal
      pointsAgainst: Math.round(standing.pointsAgainst * 10) / 10, // Round to 1 decimal
      winPercentage: Math.round(standing.winPercentage * 1000) / 1000, // Round to 3 decimals
      rank: index + 1
    }));

    // Prepare response
    const response: GetStandingsResponseDto = {
      leagueInfo: {
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        currentSeasonWeek: league.currentSeasonWeek,
        numberOfTeams: league.numberOfTeams
      },
      standings: standingDtos,
      isPoC: true
    };

    console.log(`[API] Standings retrieved for league ${leagueId} by user ${user.userId}`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[API Error] Failed to get league standings:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('No teams found')) {
        return NextResponse.json(
          { 
            error: 'No teams found in this league',
            details: 'The league may not have any participating teams yet.'
          } as StandingsErrorResponseDto,
          { status: 404 }
        );
      }
      
      if (error.message.includes('No lineup found')) {
        return NextResponse.json(
          { 
            error: 'Incomplete lineup data',
            details: 'Some teams may not have set their lineups for all weeks.'
          } as StandingsErrorResponseDto,
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        details: 'Failed to calculate league standings.'
      } as StandingsErrorResponseDto,
      { status: 500 }
    );
  }
}
