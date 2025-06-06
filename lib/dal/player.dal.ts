/**
 * Player Data Access Layer
 * Handles database operations for NFL player data
 */

import { get, all } from './db';

export interface NFLPlayer {
  playerId: string;
  fullName: string;
  position: "QB" | "RB" | "WR" | "TE" | "K" | "DEF";
  nflTeamAbbreviation: string;
  status?: "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week";
  projectedPoints?: number;
  keyAttributes?: {
    consistencyRating?: "High" | "Medium" | "Low";
    upsidePotential?: "High" | "Medium" | "Low";
    role?: string;
  };
  notes?: string;
}

/**
 * Gets all NFL players from the database
 */
export async function getAllNFLPlayers(): Promise<NFLPlayer[]> {
  const sql = `SELECT * FROM NFLPlayers ORDER BY fullName`;
  const rows = await all<Record<string, unknown>>(sql, []);

  return rows.map(row => ({
    playerId: row.playerId as string,
    fullName: row.fullName as string,
    position: row.position as "QB" | "RB" | "WR" | "TE" | "K" | "DEF",
    nflTeamAbbreviation: row.nflTeamAbbreviation as string,
    status: row.status as "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week" | undefined,
    projectedPoints: row.projectedPoints as number | undefined,
    keyAttributes: row.keyAttributes ? JSON.parse(row.keyAttributes as string) : undefined,
    notes: row.notes as string | undefined
  }));
}

/**
 * Gets an NFL player by ID
 */
export async function getNFLPlayerById(playerId: string): Promise<NFLPlayer | undefined> {
  const sql = `SELECT * FROM NFLPlayers WHERE playerId = ?`;
  const row = await get<Record<string, unknown>>(sql, [playerId]);

  if (!row) {
    return undefined;
  }

  return {
    playerId: row.playerId as string,
    fullName: row.fullName as string,
    position: row.position as "QB" | "RB" | "WR" | "TE" | "K" | "DEF",
    nflTeamAbbreviation: row.nflTeamAbbreviation as string,
    status: row.status as "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week" | undefined,
    projectedPoints: row.projectedPoints as number | undefined,
    keyAttributes: row.keyAttributes ? JSON.parse(row.keyAttributes as string) : undefined,
    notes: row.notes as string | undefined
  };
}

/**
 * Gets NFL players by position
 */
export async function getNFLPlayersByPosition(position: "QB" | "RB" | "WR" | "TE" | "K" | "DEF"): Promise<NFLPlayer[]> {
  const sql = `SELECT * FROM NFLPlayers WHERE position = ? ORDER BY projectedPoints DESC, fullName`;
  const rows = await all<Record<string, unknown>>(sql, [position]);

  return rows.map(row => ({
    playerId: row.playerId as string,
    fullName: row.fullName as string,
    position: row.position as "QB" | "RB" | "WR" | "TE" | "K" | "DEF",
    nflTeamAbbreviation: row.nflTeamAbbreviation as string,
    status: row.status as "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week" | undefined,
    projectedPoints: row.projectedPoints as number | undefined,
    keyAttributes: row.keyAttributes ? JSON.parse(row.keyAttributes as string) : undefined,
    notes: row.notes as string | undefined
  }));
}

/**
 * Gets multiple NFL players by their IDs
 */
export async function getNFLPlayersByIds(playerIds: string[]): Promise<NFLPlayer[]> {
  if (playerIds.length === 0) {
    return [];
  }

  const placeholders = playerIds.map(() => '?').join(',');
  const sql = `SELECT * FROM NFLPlayers WHERE playerId IN (${placeholders}) ORDER BY fullName`;
  const rows = await all<Record<string, unknown>>(sql, playerIds);

  return rows.map(row => ({
    playerId: row.playerId as string,
    fullName: row.fullName as string,
    position: row.position as "QB" | "RB" | "WR" | "TE" | "K" | "DEF",
    nflTeamAbbreviation: row.nflTeamAbbreviation as string,
    status: row.status as "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week" | undefined,
    projectedPoints: row.projectedPoints as number | undefined,
    keyAttributes: row.keyAttributes ? JSON.parse(row.keyAttributes as string) : undefined,
    notes: row.notes as string | undefined
  }));
}

/**
 * Gets NFL players that are available (not owned by any team) in a specific league
 */
export async function getAvailableNFLPlayersInLeague(
  ownedPlayerIds: string[],
  position?: "QB" | "RB" | "WR" | "TE" | "K" | "DEF",
  searchTerm?: string
): Promise<NFLPlayer[]> {
  let sql = `SELECT * FROM NFLPlayers WHERE 1=1`;
  const params: unknown[] = [];

  // Exclude owned players
  if (ownedPlayerIds.length > 0) {
    const placeholders = ownedPlayerIds.map(() => '?').join(',');
    sql += ` AND playerId NOT IN (${placeholders})`;
    params.push(...ownedPlayerIds);
  }

  // Filter by position if specified
  if (position) {
    sql += ` AND position = ?`;
    params.push(position);
  }

  // Filter by search term if specified
  if (searchTerm && searchTerm.trim().length > 0) {
    sql += ` AND fullName LIKE ?`;
    params.push(`%${searchTerm.trim()}%`);
  }

  sql += ` ORDER BY projectedPoints DESC, fullName`;

  const rows = await all<Record<string, unknown>>(sql, params);

  return rows.map(row => ({
    playerId: row.playerId as string,
    fullName: row.fullName as string,
    position: row.position as "QB" | "RB" | "WR" | "TE" | "K" | "DEF",
    nflTeamAbbreviation: row.nflTeamAbbreviation as string,
    status: row.status as "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week" | undefined,
    projectedPoints: row.projectedPoints as number | undefined,
    keyAttributes: row.keyAttributes ? JSON.parse(row.keyAttributes as string) : undefined,
    notes: row.notes as string | undefined
  }));
}

/**
 * Searches for NFL players by name
 */
export async function searchNFLPlayersByName(searchTerm: string): Promise<NFLPlayer[]> {
  const sql = `
    SELECT * FROM NFLPlayers 
    WHERE fullName LIKE ? 
    ORDER BY projectedPoints DESC, fullName
    LIMIT 50
  `;
  const rows = await all<Record<string, unknown>>(sql, [`%${searchTerm}%`]);

  return rows.map(row => ({
    playerId: row.playerId as string,
    fullName: row.fullName as string,
    position: row.position as "QB" | "RB" | "WR" | "TE" | "K" | "DEF",
    nflTeamAbbreviation: row.nflTeamAbbreviation as string,
    status: row.status as "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week" | undefined,
    projectedPoints: row.projectedPoints as number | undefined,
    keyAttributes: row.keyAttributes ? JSON.parse(row.keyAttributes as string) : undefined,
    notes: row.notes as string | undefined
  }));
}
