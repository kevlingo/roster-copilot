/**
 * Matchup Service Layer
 * Handles business logic for fantasy matchups and scoring
 * Extended for Story 1.13 with standings calculation logic
 */

import { getFantasyTeamsByLeagueId, getWeeklyLineup } from '../dal/league.dal';
import { getNFLPlayersByIds } from '../dal/player.dal';
import { getOpponentForTeam } from '../dal/game.dal';
import { FantasyTeamDto, FantasyPlayerDto, FantasyMatchupDto } from '../dtos/matchup.dto';
import { getLeagueSchedule, TeamRecord, isWeekCompleted } from './schedule.service';
import { League_PoC } from '../models/league.models';

/**
 * Determines the opponent team for a given user's team in a specific week
 * Uses the schedule service for consistent matchup determination
 */
export async function getFantasyOpponent(
  userTeamId: string,
  leagueId: string,
  weekNumber: number
): Promise<string | undefined> {
  try {
    const { getOpponentForTeamInWeek } = await import('./schedule.service');
    return await getOpponentForTeamInWeek(leagueId, userTeamId, weekNumber);
  } catch (error) {
    console.error('Error getting fantasy opponent:', error);
    return undefined;
  }
}

/**
 * Calculates fantasy points for a team's lineup in a specific week
 */
export async function calculateFantasyTeamScore(
  teamId: string, 
  weekNumber: number
): Promise<{ team: FantasyTeamDto; totalPoints: number }> {
  // Get the team's lineup for this week
  const lineup = await getWeeklyLineup(teamId, weekNumber);
  
  if (!lineup) {
    throw new Error(`No lineup found for team ${teamId} in week ${weekNumber}`);
  }

  // Get player details for starters
  const starterPlayers = await getNFLPlayersByIds(lineup.starterPlayerIds);
  
  // Calculate total fantasy points and create player DTOs
  let totalPoints = 0;
  const starterDtos: FantasyPlayerDto[] = [];

  for (const player of starterPlayers) {
    const fantasyPoints = player.projectedPoints || 0;
    totalPoints += fantasyPoints;

    // Get opponent information
    const opponent = await getOpponentForTeam(player.nflTeamAbbreviation, weekNumber);

    starterDtos.push({
      playerId: player.playerId,
      fullName: player.fullName,
      position: player.position,
      nflTeamAbbreviation: player.nflTeamAbbreviation,
      status: player.status || 'Active',
      projectedPoints: fantasyPoints,
      opponent: opponent ? `vs ${opponent}` : undefined,
      gameTime: undefined // TODO: Add game time from NFLGame data
    });
  }

  // Get team info
  const teamInfo = await getFantasyTeamsByLeagueId(lineup.leagueId);
  const team = teamInfo.find(t => t.teamId === teamId);
  
  if (!team) {
    throw new Error(`Team ${teamId} not found`);
  }

  const teamDto: FantasyTeamDto = {
    teamId: team.teamId,
    teamName: team.teamName,
    userId: team.userId,
    totalFantasyPoints: totalPoints,
    starters: starterDtos
  };

  return { team: teamDto, totalPoints };
}

/**
 * Creates a complete fantasy matchup for a user in a specific week
 */
export async function createFantasyMatchup(
  userTeamId: string,
  leagueId: string,
  weekNumber: number
): Promise<FantasyMatchupDto> {
  // Get opponent team ID
  const opponentTeamId = await getFantasyOpponent(userTeamId, leagueId, weekNumber);
  
  if (!opponentTeamId) {
    throw new Error(`No opponent found for team ${userTeamId} in week ${weekNumber}`);
  }

  // Calculate scores for both teams
  const userTeamResult = await calculateFantasyTeamScore(userTeamId, weekNumber);
  const opponentTeamResult = await calculateFantasyTeamScore(opponentTeamId, weekNumber);

  // Determine matchup status based on game statuses
  // For PoC, we'll use "Final" if we have projected points, "Scheduled" otherwise
  const matchupStatus = "Final"; // Simplified for PoC

  return {
    userTeam: userTeamResult.team,
    opponentTeam: opponentTeamResult.team,
    weekNumber,
    matchupStatus
  };
}

/**
 * Calculates win/loss/tie outcome for a matchup
 */
export function calculateMatchupOutcome(
  team1Score: number,
  team2Score: number,
  tieThreshold: number = 0.1
): { team1Result: 'W' | 'L' | 'T'; team2Result: 'W' | 'L' | 'T' } {
  const scoreDifference = Math.abs(team1Score - team2Score);

  if (scoreDifference <= tieThreshold) {
    return { team1Result: 'T', team2Result: 'T' };
  }

  if (team1Score > team2Score) {
    return { team1Result: 'W', team2Result: 'L' };
  } else {
    return { team1Result: 'L', team2Result: 'W' };
  }
}

/**
 * Calculates standings for all teams in a league
 */
export async function calculateLeagueStandings(
  leagueId: string,
  league: League_PoC
): Promise<TeamRecord[]> {
  const teams = await getFantasyTeamsByLeagueId(leagueId);
  const schedule = await getLeagueSchedule(leagueId);

  // Initialize team records
  const teamRecords: Map<string, TeamRecord> = new Map();

  for (const team of teams) {
    teamRecords.set(team.teamId, {
      teamId: team.teamId,
      teamName: team.teamName,
      userId: team.userId,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      winPercentage: 0
    });
  }

  // Process completed weeks
  const currentWeek = league.currentSeasonWeek;

  for (const matchup of schedule.matchups) {
    if (!isWeekCompleted(matchup.weekNumber, currentWeek)) {
      continue; // Skip future weeks
    }

    try {
      // Calculate scores for both teams
      const team1Result = await calculateFantasyTeamScore(matchup.team1Id, matchup.weekNumber);
      const team2Result = await calculateFantasyTeamScore(matchup.team2Id, matchup.weekNumber);

      const team1Score = team1Result.totalPoints;
      const team2Score = team2Result.totalPoints;

      // Determine outcome
      const outcome = calculateMatchupOutcome(team1Score, team2Score);

      // Update team records
      const team1Record = teamRecords.get(matchup.team1Id);
      const team2Record = teamRecords.get(matchup.team2Id);

      if (team1Record && team2Record) {
        // Update wins/losses/ties
        if (outcome.team1Result === 'W') team1Record.wins++;
        else if (outcome.team1Result === 'L') team1Record.losses++;
        else team1Record.ties++;

        if (outcome.team2Result === 'W') team2Record.wins++;
        else if (outcome.team2Result === 'L') team2Record.losses++;
        else team2Record.ties++;

        // Update points for/against
        team1Record.pointsFor += team1Score;
        team1Record.pointsAgainst += team2Score;
        team2Record.pointsFor += team2Score;
        team2Record.pointsAgainst += team1Score;
      }
    } catch (error) {
      console.warn(`Failed to calculate scores for matchup in week ${matchup.weekNumber}:`, error);
      // Continue processing other matchups
    }
  }

  // Calculate win percentages and convert to array
  const standings: TeamRecord[] = Array.from(teamRecords.values()).map(record => {
    const totalGames = record.wins + record.losses + record.ties;
    record.winPercentage = totalGames > 0 ? (record.wins + record.ties * 0.5) / totalGames : 0;
    return record;
  });

  // Sort by win percentage (descending), then by points for (descending)
  standings.sort((a, b) => {
    if (a.winPercentage !== b.winPercentage) {
      return b.winPercentage - a.winPercentage;
    }
    return b.pointsFor - a.pointsFor;
  });

  return standings;
}
