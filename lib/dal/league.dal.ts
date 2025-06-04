/**
 * League Data Access Layer
 * Handles database operations for League_PoC and FantasyTeam_PoC
 */

import { v4 as uuidv4 } from 'uuid';
import { run, get, all } from './db';
import { League_PoC, DEFAULT_ROSTER_SETTINGS } from '../models/league.models';

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
    leagueId: row.leagueId,
    leagueName: row.leagueName,
    commissionerUserId: row.commissionerUserId,
    numberOfTeams: row.numberOfTeams,
    scoringType: row.scoringType,
    draftStatus: row.draftStatus,
    currentSeasonWeek: row.currentSeasonWeek,
    participatingTeamIds: row.participatingTeamIds ? JSON.parse(row.participatingTeamIds) : [],
    rosterSettings: row.rosterSettings ? JSON.parse(row.rosterSettings) : DEFAULT_ROSTER_SETTINGS,
    createdAt: row.createdAt
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
    leagueId: row.leagueId,
    leagueName: row.leagueName,
    commissionerUserId: row.commissionerUserId,
    numberOfTeams: row.numberOfTeams,
    scoringType: row.scoringType,
    draftStatus: row.draftStatus,
    currentSeasonWeek: row.currentSeasonWeek,
    participatingTeamIds: row.participatingTeamIds ? JSON.parse(row.participatingTeamIds) : [],
    rosterSettings: row.rosterSettings ? JSON.parse(row.rosterSettings) : DEFAULT_ROSTER_SETTINGS,
    createdAt: row.createdAt
  }));
}
