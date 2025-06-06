/**
 * Schedule Service Layer
 * Handles business logic for league schedule generation and management
 * Based on Story 1.13 requirements for standings and schedule functionality
 */

import { FantasyTeam_PoC } from '../models/league.models';
import { getFantasyTeamsByLeagueId } from '../dal/league.dal';

// Schedule-related interfaces
export interface WeeklyMatchup {
  weekNumber: number;
  team1Id: string;
  team2Id: string;
  team1Score?: number;
  team2Score?: number;
  isCompleted: boolean;
}

export interface LeagueSchedule {
  leagueId: string;
  numberOfWeeks: number;
  matchups: WeeklyMatchup[];
}

export interface TeamRecord {
  teamId: string;
  teamName: string;
  userId: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  winPercentage: number;
}

/**
 * Generates a round-robin schedule for a league
 * Uses a standard round-robin algorithm that ensures each team plays every other team
 */
export function generateLeagueSchedule(
  leagueId: string,
  teams: FantasyTeam_PoC[],
  numberOfWeeks: number = 13
): LeagueSchedule {
  const numberOfTeams = teams.length;
  
  if (numberOfTeams < 2) {
    throw new Error('Need at least 2 teams to generate a schedule');
  }

  const matchups: WeeklyMatchup[] = [];
  
  // For round-robin, we need (numberOfTeams - 1) weeks if numberOfTeams is even
  // or numberOfTeams weeks if numberOfTeams is odd
  const roundRobinWeeks = numberOfTeams % 2 === 0 ? numberOfTeams - 1 : numberOfTeams;
  
  // Create team array for round-robin algorithm
  const teamIds = teams.map(team => team.teamId);
  
  // If odd number of teams, add a "bye" placeholder
  if (numberOfTeams % 2 === 1) {
    teamIds.push('BYE');
  }

  const totalTeams = teamIds.length;
  
  // Generate round-robin schedule
  for (let week = 0; week < Math.min(roundRobinWeeks, numberOfWeeks); week++) {
    const weekNumber = week + 1;
    
    // Generate matchups for this week
    for (let i = 0; i < totalTeams / 2; i++) {
      const team1Index = i;
      const team2Index = totalTeams - 1 - i;
      
      const team1Id = teamIds[team1Index];
      const team2Id = teamIds[team2Index];
      
      // Skip if either team is a bye
      if (team1Id !== 'BYE' && team2Id !== 'BYE') {
        matchups.push({
          weekNumber,
          team1Id,
          team2Id,
          isCompleted: false
        });
      }
    }
    
    // Rotate teams for next week (keep first team fixed, rotate others)
    if (week < roundRobinWeeks - 1) {
      const lastTeam = teamIds.pop()!;
      teamIds.splice(1, 0, lastTeam);
    }
  }

  // If we need more weeks than the round-robin provides, repeat the cycle
  if (numberOfWeeks > roundRobinWeeks) {
    const originalMatchups = [...matchups];
    let currentWeek = roundRobinWeeks + 1;
    
    while (currentWeek <= numberOfWeeks) {
      for (const matchup of originalMatchups) {
        if (currentWeek > numberOfWeeks) break;
        
        matchups.push({
          ...matchup,
          weekNumber: currentWeek,
          isCompleted: false
        });
        
        // Move to next week after adding all matchups for current week
        if (matchup.weekNumber === originalMatchups[originalMatchups.length - 1].weekNumber) {
          currentWeek++;
        }
      }
    }
  }

  return {
    leagueId,
    numberOfWeeks: Math.min(numberOfWeeks, matchups.length > 0 ? Math.max(...matchups.map(m => m.weekNumber)) : 0),
    matchups
  };
}

/**
 * Gets the schedule for a specific league
 * Generates it on-demand using deterministic algorithm
 */
export async function getLeagueSchedule(
  leagueId: string,
  numberOfWeeks: number = 13
): Promise<LeagueSchedule> {
  const teams = await getFantasyTeamsByLeagueId(leagueId);
  
  if (teams.length === 0) {
    throw new Error(`No teams found for league ${leagueId}`);
  }

  return generateLeagueSchedule(leagueId, teams, numberOfWeeks);
}

/**
 * Gets matchups for a specific week
 */
export async function getWeeklyMatchups(
  leagueId: string,
  weekNumber: number
): Promise<WeeklyMatchup[]> {
  const schedule = await getLeagueSchedule(leagueId);
  return schedule.matchups.filter(matchup => matchup.weekNumber === weekNumber);
}

/**
 * Gets the opponent for a specific team in a specific week
 */
export async function getOpponentForTeamInWeek(
  leagueId: string,
  teamId: string,
  weekNumber: number
): Promise<string | undefined> {
  try {
    const weeklyMatchups = await getWeeklyMatchups(leagueId, weekNumber);

    for (const matchup of weeklyMatchups) {
      if (matchup.team1Id === teamId) {
        return matchup.team2Id;
      }
      if (matchup.team2Id === teamId) {
        return matchup.team1Id;
      }
    }

    return undefined; // Team has a bye week or not found
  } catch (error) {
    console.warn(`Error getting opponent for team ${teamId} in week ${weekNumber}:`, error);
    return undefined;
  }
}

/**
 * Determines if a specific week's matchups are completed
 * Based on current season week from league settings
 */
export function isWeekCompleted(weekNumber: number, currentSeasonWeek: number): boolean {
  return weekNumber < currentSeasonWeek;
}
