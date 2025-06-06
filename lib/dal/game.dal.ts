/**
 * Game Data Access Layer
 * Handles database operations for NFL game data
 */

import { get, all } from './db';

export interface NFLGame {
  gameId: string;
  weekNumber: number;
  homeTeamAbbreviation: string;
  awayTeamAbbreviation: string;
  gameDateTime_ISO?: string;
  matchupContextNotes?: string[];
  homeScore?: number;
  awayScore?: number;
  gameStatus?: "Scheduled" | "InProgress" | "Final";
}

/**
 * Gets all NFL games for a specific week
 */
export async function getNFLGamesByWeek(weekNumber: number): Promise<NFLGame[]> {
  const sql = `SELECT * FROM NFLGames WHERE weekNumber = ? ORDER BY gameDateTime_ISO`;
  const rows = await all<Record<string, unknown>>(sql, [weekNumber]);

  return rows.map(row => ({
    gameId: row.gameId as string,
    weekNumber: row.weekNumber as number,
    homeTeamAbbreviation: row.homeTeamAbbreviation as string,
    awayTeamAbbreviation: row.awayTeamAbbreviation as string,
    gameDateTime_ISO: row.gameDateTime_ISO as string | undefined,
    matchupContextNotes: row.matchupContextNotes ? JSON.parse(row.matchupContextNotes as string) : undefined,
    homeScore: row.homeScore as number | undefined,
    awayScore: row.awayScore as number | undefined,
    gameStatus: row.gameStatus as "Scheduled" | "InProgress" | "Final" | undefined
  }));
}

/**
 * Gets an NFL game by ID
 */
export async function getNFLGameById(gameId: string): Promise<NFLGame | undefined> {
  const sql = `SELECT * FROM NFLGames WHERE gameId = ?`;
  const row = await get<Record<string, unknown>>(sql, [gameId]);

  if (!row) {
    return undefined;
  }

  return {
    gameId: row.gameId as string,
    weekNumber: row.weekNumber as number,
    homeTeamAbbreviation: row.homeTeamAbbreviation as string,
    awayTeamAbbreviation: row.awayTeamAbbreviation as string,
    gameDateTime_ISO: row.gameDateTime_ISO as string | undefined,
    matchupContextNotes: row.matchupContextNotes ? JSON.parse(row.matchupContextNotes as string) : undefined,
    homeScore: row.homeScore as number | undefined,
    awayScore: row.awayScore as number | undefined,
    gameStatus: row.gameStatus as "Scheduled" | "InProgress" | "Final" | undefined
  };
}

/**
 * Gets all NFL games (for testing/admin purposes)
 */
export async function getAllNFLGames(): Promise<NFLGame[]> {
  const sql = `SELECT * FROM NFLGames ORDER BY weekNumber, gameDateTime_ISO`;
  const rows = await all<Record<string, unknown>>(sql, []);

  return rows.map(row => ({
    gameId: row.gameId as string,
    weekNumber: row.weekNumber as number,
    homeTeamAbbreviation: row.homeTeamAbbreviation as string,
    awayTeamAbbreviation: row.awayTeamAbbreviation as string,
    gameDateTime_ISO: row.gameDateTime_ISO as string | undefined,
    matchupContextNotes: row.matchupContextNotes ? JSON.parse(row.matchupContextNotes as string) : undefined,
    homeScore: row.homeScore as number | undefined,
    awayScore: row.awayScore as number | undefined,
    gameStatus: row.gameStatus as "Scheduled" | "InProgress" | "Final" | undefined
  }));
}

/**
 * Gets the opponent team abbreviation for a given team in a specific week
 */
export async function getOpponentForTeam(teamAbbreviation: string, weekNumber: number): Promise<string | undefined> {
  const sql = `
    SELECT 
      CASE 
        WHEN homeTeamAbbreviation = ? THEN awayTeamAbbreviation
        WHEN awayTeamAbbreviation = ? THEN homeTeamAbbreviation
        ELSE NULL
      END as opponent
    FROM NFLGames 
    WHERE weekNumber = ? 
    AND (homeTeamAbbreviation = ? OR awayTeamAbbreviation = ?)
  `;
  
  const row = await get<{ opponent: string | null }>(sql, [
    teamAbbreviation, 
    teamAbbreviation, 
    weekNumber, 
    teamAbbreviation, 
    teamAbbreviation
  ]);

  return row?.opponent || undefined;
}
