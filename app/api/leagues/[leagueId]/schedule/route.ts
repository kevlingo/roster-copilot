/**
 * League Schedule API Routes
 * GET /api/leagues/[leagueId]/schedule - Get league schedule with matchups
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { getLeagueById, getFantasyTeamByUserAndLeague, getFantasyTeamsByLeagueId } from '@/lib/dal/league.dal';
import { getLeagueSchedule, isWeekCompleted } from '@/lib/services/schedule.service';
import { calculateFantasyTeamScore, calculateMatchupOutcome } from '@/lib/services/matchup.service';
import { 
  GetScheduleResponseDto, 
  ScheduleErrorResponseDto,
  WeeklyScheduleDto,
  ScheduleMatchupDto,
  ScheduleTeamDto
} from '@/lib/dtos/schedule.dto';

/**
 * GET /api/leagues/[leagueId]/schedule
 * Gets league schedule with matchups and scores
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
        { error: 'Authentication required' } as ScheduleErrorResponseDto,
        { status: 401 }
      );
    }

    const { leagueId } = await params;
    
    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' } as ScheduleErrorResponseDto,
        { status: 400 }
      );
    }

    // Get league information
    const league = await getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' } as ScheduleErrorResponseDto,
        { status: 404 }
      );
    }

    // Get user's team (for highlighting)
    const userTeam = await getFantasyTeamByUserAndLeague(user.userId, leagueId);
    
    // Get all teams for team info lookup
    const allTeams = await getFantasyTeamsByLeagueId(leagueId);
    const teamLookup = new Map(allTeams.map(team => [team.teamId, team]));

    // Get league schedule
    const schedule = await getLeagueSchedule(leagueId);
    
    // Group matchups by week
    const weeklyMatchups = new Map<number, typeof schedule.matchups>();
    for (const matchup of schedule.matchups) {
      if (!weeklyMatchups.has(matchup.weekNumber)) {
        weeklyMatchups.set(matchup.weekNumber, []);
      }
      weeklyMatchups.get(matchup.weekNumber)!.push(matchup);
    }

    // Build weekly schedule DTOs
    const weeks: WeeklyScheduleDto[] = [];
    
    for (let weekNumber = 1; weekNumber <= schedule.numberOfWeeks; weekNumber++) {
      const weekMatchups = weeklyMatchups.get(weekNumber) || [];
      const isCompleted = isWeekCompleted(weekNumber, league.currentSeasonWeek);
      
      const matchupDtos: ScheduleMatchupDto[] = [];
      
      for (const matchup of weekMatchups) {
        const team1Info = teamLookup.get(matchup.team1Id);
        const team2Info = teamLookup.get(matchup.team2Id);
        
        if (!team1Info || !team2Info) {
          console.warn(`Missing team info for matchup: ${matchup.team1Id} vs ${matchup.team2Id}`);
          continue;
        }

        const team1Dto: ScheduleTeamDto = {
          teamId: team1Info.teamId,
          teamName: team1Info.teamName,
          userId: team1Info.userId
        };

        const team2Dto: ScheduleTeamDto = {
          teamId: team2Info.teamId,
          teamName: team2Info.teamName,
          userId: team2Info.userId
        };

        let team1Score: number | undefined;
        let team2Score: number | undefined;
        let winner: 'team1' | 'team2' | 'tie' | undefined;

        // Calculate scores for completed weeks
        if (isCompleted) {
          try {
            const team1Result = await calculateFantasyTeamScore(matchup.team1Id, weekNumber);
            const team2Result = await calculateFantasyTeamScore(matchup.team2Id, weekNumber);
            
            team1Score = Math.round(team1Result.totalPoints * 10) / 10;
            team2Score = Math.round(team2Result.totalPoints * 10) / 10;
            
            const outcome = calculateMatchupOutcome(team1Score, team2Score);
            if (outcome.team1Result === 'W') winner = 'team1';
            else if (outcome.team2Result === 'W') winner = 'team2';
            else winner = 'tie';
            
          } catch (error) {
            console.warn(`Failed to calculate scores for week ${weekNumber} matchup:`, error);
          }
        }

        const isUserTeamInvolved = userTeam && 
          (matchup.team1Id === userTeam.teamId || matchup.team2Id === userTeam.teamId);

        matchupDtos.push({
          weekNumber,
          team1: team1Dto,
          team2: team2Dto,
          team1Score,
          team2Score,
          isCompleted,
          isUserTeamInvolved: !!isUserTeamInvolved,
          winner
        });
      }

      weeks.push({
        weekNumber,
        matchups: matchupDtos,
        isCompleted
      });
    }

    // Prepare response
    const response: GetScheduleResponseDto = {
      leagueInfo: {
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        currentSeasonWeek: league.currentSeasonWeek,
        numberOfTeams: league.numberOfTeams
      },
      userTeamId: userTeam?.teamId,
      weeks,
      totalWeeks: schedule.numberOfWeeks,
      isPoC: true
    };

    console.log(`[API] Schedule retrieved for league ${leagueId} by user ${user.userId}`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[API Error] Failed to get league schedule:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('No teams found')) {
        return NextResponse.json(
          { 
            error: 'No teams found in this league',
            details: 'The league may not have any participating teams yet.'
          } as ScheduleErrorResponseDto,
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        details: 'Failed to retrieve league schedule.'
      } as ScheduleErrorResponseDto,
      { status: 500 }
    );
  }
}
