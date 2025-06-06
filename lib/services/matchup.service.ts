/**
 * Matchup Service Layer
 * Handles business logic for fantasy matchups and scoring
 */

import { getFantasyTeamsByLeagueId, getWeeklyLineup } from '../dal/league.dal';
import { getNFLPlayersByIds } from '../dal/player.dal';
import { getOpponentForTeam } from '../dal/game.dal';
import { FantasyTeamDto, FantasyPlayerDto, FantasyMatchupDto } from '../dtos/matchup.dto';

/**
 * Determines the opponent team for a given user's team in a specific week
 * For PoC: Simple round-robin scheduling based on team order
 */
export async function getFantasyOpponent(
  userTeamId: string, 
  leagueId: string, 
  weekNumber: number
): Promise<string | undefined> {
  // Get all teams in the league
  const allTeams = await getFantasyTeamsByLeagueId(leagueId);
  
  if (allTeams.length < 2) {
    return undefined; // Need at least 2 teams for matchups
  }

  // Find user's team index
  const userTeamIndex = allTeams.findIndex(team => team.teamId === userTeamId);
  if (userTeamIndex === -1) {
    return undefined;
  }

  // Simple PoC matchup logic: rotate opponents each week
  const numberOfTeams = allTeams.length;

  // For PoC, use a simple rotation algorithm
  // Week 1: team 0 vs team 1, team 2 vs team 3, etc.
  // Week 2: team 0 vs team 2, team 1 vs team 3, etc.
  // Week 3: team 0 vs team 3, team 1 vs team 2, etc.

  if (numberOfTeams < 2) {
    return undefined; // Need at least 2 teams
  }

  // Simple rotation: each team plays against the next team in rotation
  const weekOffset = (weekNumber - 1) % (numberOfTeams - 1);
  let opponentIndex = (userTeamIndex + 1 + weekOffset) % numberOfTeams;

  // If we wrapped around to ourselves, skip to the next team
  if (opponentIndex === userTeamIndex) {
    opponentIndex = (opponentIndex + 1) % numberOfTeams;
  }

  return allTeams[opponentIndex].teamId;
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
