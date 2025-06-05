/**
 * League Data Access Layer
 * Handles database operations for League_PoC and FantasyTeam_PoC
 */

import { v4 as uuidv4 } from 'uuid';
import { run, get, all } from './db';
import { League_PoC, FantasyTeam_PoC, WeeklyLineup_PoC, DEFAULT_ROSTER_SETTINGS } from '../models/league.models';

/**
 * Creates a new league in the database
 */
export async function createLeague(
  leagueName: string,
  commissionerUserId: string,
  numberOfTeams: 8 | 10 | 12,
  scoringType: "Standard" | "PPR"
): Promise<League_PoC> {
  const leagueId = uuidv4();
  const createdAt = new Date().toISOString();
  const currentSeasonWeek = 1;
  const draftStatus = "Scheduled";
  const participatingTeamIds: string[] = [];
  const rosterSettings = DEFAULT_ROSTER_SETTINGS;

  const sql = `
    INSERT INTO Leagues_PoC (
      leagueId, leagueName, commissionerUserId, numberOfTeams, scoringType,
      draftStatus, currentSeasonWeek, participatingTeamIds, rosterSettings, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    leagueId,
    leagueName,
    commissionerUserId,
    numberOfTeams,
    scoringType,
    draftStatus,
    currentSeasonWeek,
    JSON.stringify(participatingTeamIds),
    JSON.stringify(rosterSettings),
    createdAt
  ];

  await run(sql, params);

  return {
    leagueId,
    leagueName,
    commissionerUserId,
    numberOfTeams,
    scoringType,
    draftStatus,
    currentSeasonWeek,
    participatingTeamIds,
    rosterSettings,
    createdAt
  };
}

/**
 * Retrieves a league by ID
 */
export async function getLeagueById(leagueId: string): Promise<League_PoC | undefined> {
  const sql = `SELECT * FROM Leagues_PoC WHERE leagueId = ?`;
  const row = await get<Record<string, unknown>>(sql, [leagueId]);
  
  if (!row) {
    return undefined;
  }

  return {
    leagueId: row.leagueId as string,
    leagueName: row.leagueName as string,
    commissionerUserId: row.commissionerUserId as string,
    numberOfTeams: row.numberOfTeams as 8 | 10 | 12,
    scoringType: row.scoringType as "Standard" | "PPR",
    draftStatus: row.draftStatus as "Scheduled" | "InProgress" | "Completed",
    currentSeasonWeek: row.currentSeasonWeek as number,
    participatingTeamIds: row.participatingTeamIds ? JSON.parse(row.participatingTeamIds as string) : [],
    rosterSettings: row.rosterSettings ? JSON.parse(row.rosterSettings as string) : DEFAULT_ROSTER_SETTINGS,
    createdAt: row.createdAt as string
  };
}

/**
 * Checks if a league name already exists (for uniqueness validation)
 */
export async function isLeagueNameTaken(leagueName: string): Promise<boolean> {
  const sql = `SELECT COUNT(*) as count FROM Leagues_PoC WHERE leagueName = ?`;
  const result = await get<{ count: number }>(sql, [leagueName]);
  return (result?.count || 0) > 0;
}

/**
 * Gets all leagues where a user is the commissioner or a participant
 */
export async function getUserLeagues(userId: string): Promise<League_PoC[]> {
  // For now, just get leagues where user is commissioner
  // Later stories will handle participation
  const sql = `SELECT * FROM Leagues_PoC WHERE commissionerUserId = ?`;
  const rows = await all<Record<string, unknown>>(sql, [userId]);

  return rows.map(row => ({
    leagueId: row.leagueId as string,
    leagueName: row.leagueName as string,
    commissionerUserId: row.commissionerUserId as string,
    numberOfTeams: row.numberOfTeams as 8 | 10 | 12,
    scoringType: row.scoringType as "Standard" | "PPR",
    draftStatus: row.draftStatus as "Scheduled" | "InProgress" | "Completed",
    currentSeasonWeek: row.currentSeasonWeek as number,
    participatingTeamIds: row.participatingTeamIds ? JSON.parse(row.participatingTeamIds as string) : [],
    rosterSettings: row.rosterSettings ? JSON.parse(row.rosterSettings as string) : DEFAULT_ROSTER_SETTINGS,
    createdAt: row.createdAt as string
  }));
}

// ===== FANTASY TEAM DAL FUNCTIONS =====

/**
 * Creates a new fantasy team in the database
 */
export async function createFantasyTeam(
  leagueId: string,
  userId: string,
  teamName: string
): Promise<FantasyTeam_PoC> {
  const teamId = uuidv4();
  const createdAt = new Date().toISOString();
  const playerIds_onRoster: string[] = [];

  const sql = `
    INSERT INTO FantasyTeams_PoC (
      teamId, leagueId, userId, teamName, playerIds_onRoster, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    teamId,
    leagueId,
    userId,
    teamName,
    JSON.stringify(playerIds_onRoster),
    createdAt
  ];

  await run(sql, params);

  return {
    teamId,
    leagueId,
    userId,
    teamName,
    playerIds_onRoster,
    createdAt
  };
}

/**
 * Retrieves a fantasy team by ID
 */
export async function getFantasyTeamById(teamId: string): Promise<FantasyTeam_PoC | undefined> {
  const sql = `SELECT * FROM FantasyTeams_PoC WHERE teamId = ?`;
  const row = await get<Record<string, unknown>>(sql, [teamId]);

  if (!row) {
    return undefined;
  }

  return {
    teamId: row.teamId as string,
    leagueId: row.leagueId as string,
    userId: row.userId as string,
    teamName: row.teamName as string,
    playerIds_onRoster: row.playerIds_onRoster ? JSON.parse(row.playerIds_onRoster as string) : [],
    createdAt: row.createdAt as string
  };
}

/**
 * Gets all fantasy teams for a specific user
 */
export async function getFantasyTeamsByUserId(userId: string): Promise<FantasyTeam_PoC[]> {
  const sql = `SELECT * FROM FantasyTeams_PoC WHERE userId = ?`;
  const rows = await all<Record<string, unknown>>(sql, [userId]);

  return rows.map(row => ({
    teamId: row.teamId as string,
    leagueId: row.leagueId as string,
    userId: row.userId as string,
    teamName: row.teamName as string,
    playerIds_onRoster: row.playerIds_onRoster ? JSON.parse(row.playerIds_onRoster as string) : [],
    createdAt: row.createdAt as string
  }));
}

/**
 * Gets all fantasy teams for a specific league
 */
export async function getFantasyTeamsByLeagueId(leagueId: string): Promise<FantasyTeam_PoC[]> {
  const sql = `SELECT * FROM FantasyTeams_PoC WHERE leagueId = ?`;
  const rows = await all<Record<string, unknown>>(sql, [leagueId]);

  return rows.map(row => ({
    teamId: row.teamId as string,
    leagueId: row.leagueId as string,
    userId: row.userId as string,
    teamName: row.teamName as string,
    playerIds_onRoster: row.playerIds_onRoster ? JSON.parse(row.playerIds_onRoster as string) : [],
    createdAt: row.createdAt as string
  }));
}

/**
 * Updates the draft status of a league
 */
export async function updateLeagueDraftStatus(
  leagueId: string,
  draftStatus: "Scheduled" | "InProgress" | "Completed"
): Promise<void> {
  const sql = `UPDATE Leagues_PoC SET draftStatus = ? WHERE leagueId = ?`;
  await run(sql, [draftStatus, leagueId]);
}

/**
 * Gets a fantasy team by user ID and league ID
 */
export async function getFantasyTeamByUserAndLeague(
  userId: string,
  leagueId: string
): Promise<FantasyTeam_PoC | undefined> {
  const sql = `SELECT * FROM FantasyTeams_PoC WHERE userId = ? AND leagueId = ?`;
  const row = await get<Record<string, unknown>>(sql, [userId, leagueId]);

  if (!row) {
    return undefined;
  }

  return {
    teamId: row.teamId as string,
    leagueId: row.leagueId as string,
    userId: row.userId as string,
    teamName: row.teamName as string,
    playerIds_onRoster: row.playerIds_onRoster ? JSON.parse(row.playerIds_onRoster as string) : [],
    createdAt: row.createdAt as string
  };
}

/**
 * Adds a player to a team's roster
 */
export async function addPlayerToTeamRoster(teamId: string, playerId: string): Promise<void> {
  // Get current roster
  const team = await getFantasyTeamById(teamId);
  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }

  // Add player to roster if not already there
  const updatedRoster = [...team.playerIds_onRoster];
  if (!updatedRoster.includes(playerId)) {
    updatedRoster.push(playerId);
  }

  // Update team roster
  const sql = `UPDATE FantasyTeams_PoC SET playerIds_onRoster = ? WHERE teamId = ?`;
  await run(sql, [JSON.stringify(updatedRoster), teamId]);
}

/**
 * Checks if a user already has a team in a specific league
 */
export async function userHasTeamInLeague(userId: string, leagueId: string): Promise<boolean> {
  const sql = `SELECT COUNT(*) as count FROM FantasyTeams_PoC WHERE userId = ? AND leagueId = ?`;
  const result = await get<{ count: number }>(sql, [userId, leagueId]);
  return (result?.count || 0) > 0;
}

/**
 * Updates a league's participating team IDs array
 */
export async function updateLeagueParticipatingTeams(
  leagueId: string,
  participatingTeamIds: string[]
): Promise<void> {
  const sql = `UPDATE Leagues_PoC SET participatingTeamIds = ? WHERE leagueId = ?`;
  await run(sql, [JSON.stringify(participatingTeamIds), leagueId]);
}

// ===== WEEKLY LINEUP DAL FUNCTIONS =====

/**
 * Creates or updates a weekly lineup for a team
 */
export async function saveWeeklyLineup(
  teamId: string,
  leagueId: string,
  weekNumber: number,
  starterPlayerIds: string[],
  benchPlayerIds: string[]
): Promise<WeeklyLineup_PoC> {
  const now = new Date().toISOString();

  // Check if lineup already exists for this team and week
  const existingLineup = await getWeeklyLineup(teamId, weekNumber);

  if (existingLineup) {
    // Update existing lineup
    const sql = `
      UPDATE WeeklyLineups_PoC
      SET starterPlayerIds = ?, benchPlayerIds = ?, updatedAt = ?
      WHERE teamId = ? AND weekNumber = ?
    `;

    await run(sql, [
      JSON.stringify(starterPlayerIds),
      JSON.stringify(benchPlayerIds),
      now,
      teamId,
      weekNumber
    ]);

    return {
      ...existingLineup,
      starterPlayerIds,
      benchPlayerIds,
      updatedAt: now
    };
  } else {
    // Create new lineup
    const lineupId = uuidv4();

    const sql = `
      INSERT INTO WeeklyLineups_PoC (
        lineupId, teamId, leagueId, weekNumber, starterPlayerIds, benchPlayerIds, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await run(sql, [
      lineupId,
      teamId,
      leagueId,
      weekNumber,
      JSON.stringify(starterPlayerIds),
      JSON.stringify(benchPlayerIds),
      now,
      now
    ]);

    return {
      lineupId,
      teamId,
      leagueId,
      weekNumber,
      starterPlayerIds,
      benchPlayerIds,
      createdAt: now,
      updatedAt: now
    };
  }
}

/**
 * Retrieves a weekly lineup for a team and week
 */
export async function getWeeklyLineup(teamId: string, weekNumber: number): Promise<WeeklyLineup_PoC | undefined> {
  const sql = `SELECT * FROM WeeklyLineups_PoC WHERE teamId = ? AND weekNumber = ?`;
  const row = await get<Record<string, unknown>>(sql, [teamId, weekNumber]);

  if (!row) {
    return undefined;
  }

  return {
    lineupId: row.lineupId as string,
    teamId: row.teamId as string,
    leagueId: row.leagueId as string,
    weekNumber: row.weekNumber as number,
    starterPlayerIds: row.starterPlayerIds ? JSON.parse(row.starterPlayerIds as string) : [],
    benchPlayerIds: row.benchPlayerIds ? JSON.parse(row.benchPlayerIds as string) : [],
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string
  };
}

/**
 * Gets all weekly lineups for a team
 */
export async function getWeeklyLineupsByTeam(teamId: string): Promise<WeeklyLineup_PoC[]> {
  const sql = `SELECT * FROM WeeklyLineups_PoC WHERE teamId = ? ORDER BY weekNumber`;
  const rows = await all<Record<string, unknown>>(sql, [teamId]);

  return rows.map(row => ({
    lineupId: row.lineupId as string,
    teamId: row.teamId as string,
    leagueId: row.leagueId as string,
    weekNumber: row.weekNumber as number,
    starterPlayerIds: row.starterPlayerIds ? JSON.parse(row.starterPlayerIds as string) : [],
    benchPlayerIds: row.benchPlayerIds ? JSON.parse(row.benchPlayerIds as string) : [],
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string
  }));
}
