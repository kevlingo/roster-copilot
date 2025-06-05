/**
 * Draft Data Access Layer
 * Handles database operations for draft-related functionality
 */

import { v4 as uuidv4 } from 'uuid';
import { run, get, all } from './db';
import { DraftPick, DraftState, getTeamForPick, calculateTotalPicks } from '../models/draft.models';
import { League_PoC, FantasyTeam_PoC } from '../models/league.models';

/**
 * Initializes a draft for a league
 * Creates draft state and all draft pick slots
 */
export async function initializeDraft(
  league: League_PoC,
  teams: FantasyTeam_PoC[]
): Promise<DraftState> {
  const leagueId = league.leagueId;
  const numberOfTeams = teams.length;
  
  if (numberOfTeams !== league.numberOfTeams) {
    throw new Error(`Expected ${league.numberOfTeams} teams, but found ${numberOfTeams}`);
  }

  // Calculate draft parameters
  const rosterSettings = league.rosterSettings || {
    QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1, BENCH: 6
  };
  const totalPicks = calculateTotalPicks(numberOfTeams, rosterSettings);
  const totalRounds = Math.ceil(totalPicks / numberOfTeams);
  
  // Create draft order (for PoC, use team creation order)
  const draftOrder = teams
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(team => team.teamId);

  // Get first pick info
  const firstPickInfo = getTeamForPick(draftOrder, 1);
  
  const draftState: DraftState = {
    leagueId,
    draftOrder,
    currentPickNumber: 1,
    currentRound: 1,
    currentTeamId: firstPickInfo.teamId,
    isComplete: false,
    draftStartedAt: new Date().toISOString(),
    totalPicks,
    totalRounds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Insert draft state
  const insertDraftStateSQL = `
    INSERT INTO DraftStates (
      leagueId, draftOrder, currentPickNumber, currentRound, currentTeamId,
      isComplete, draftStartedAt, totalPicks, totalRounds, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await run(insertDraftStateSQL, [
    draftState.leagueId,
    JSON.stringify(draftState.draftOrder),
    draftState.currentPickNumber,
    draftState.currentRound,
    draftState.currentTeamId,
    draftState.isComplete ? 1 : 0,
    draftState.draftStartedAt,
    draftState.totalPicks,
    draftState.totalRounds,
    draftState.createdAt,
    draftState.updatedAt
  ]);

  // Create all draft pick slots
  for (let pickNumber = 1; pickNumber <= totalPicks; pickNumber++) {
    const pickInfo = getTeamForPick(draftOrder, pickNumber);
    const draftPick: DraftPick = {
      pickId: uuidv4(),
      leagueId,
      pickNumber,
      round: pickInfo.round,
      teamId: pickInfo.teamId,
      createdAt: new Date().toISOString()
    };

    const insertPickSQL = `
      INSERT INTO DraftPicks (
        pickId, leagueId, pickNumber, round, teamId, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    await run(insertPickSQL, [
      draftPick.pickId,
      draftPick.leagueId,
      draftPick.pickNumber,
      draftPick.round,
      draftPick.teamId,
      draftPick.createdAt
    ]);
  }

  return draftState;
}

/**
 * Gets the current draft state for a league
 */
export async function getDraftState(leagueId: string): Promise<DraftState | undefined> {
  const sql = `SELECT * FROM DraftStates WHERE leagueId = ?`;
  const row = await get<Record<string, unknown>>(sql, [leagueId]);
  
  if (!row) {
    return undefined;
  }

  return {
    leagueId: row.leagueId as string,
    draftOrder: JSON.parse(row.draftOrder as string),
    currentPickNumber: row.currentPickNumber as number,
    currentRound: row.currentRound as number,
    currentTeamId: row.currentTeamId as string,
    isComplete: Boolean(row.isComplete),
    draftStartedAt: row.draftStartedAt as string | undefined,
    draftCompletedAt: row.draftCompletedAt as string | undefined,
    totalPicks: row.totalPicks as number,
    totalRounds: row.totalRounds as number,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string
  };
}

/**
 * Gets all draft picks for a league
 */
export async function getDraftPicks(leagueId: string): Promise<DraftPick[]> {
  const sql = `SELECT * FROM DraftPicks WHERE leagueId = ? ORDER BY pickNumber`;
  const rows = await all<Record<string, unknown>>(sql, [leagueId]);

  return rows.map(row => ({
    pickId: row.pickId as string,
    leagueId: row.leagueId as string,
    pickNumber: row.pickNumber as number,
    round: row.round as number,
    teamId: row.teamId as string,
    playerId: row.playerId as string | undefined,
    pickTimestamp: row.pickTimestamp as string | undefined,
    createdAt: row.createdAt as string
  }));
}

/**
 * Makes a draft pick
 */
export async function makeDraftPick(
  leagueId: string,
  pickNumber: number,
  playerId: string
): Promise<DraftPick> {
  const pickTimestamp = new Date().toISOString();

  // Update the draft pick
  const updatePickSQL = `
    UPDATE DraftPicks 
    SET playerId = ?, pickTimestamp = ?
    WHERE leagueId = ? AND pickNumber = ?
  `;

  await run(updatePickSQL, [playerId, pickTimestamp, leagueId, pickNumber]);

  // Get the updated pick
  const getPickSQL = `SELECT * FROM DraftPicks WHERE leagueId = ? AND pickNumber = ?`;
  const row = await get<Record<string, unknown>>(getPickSQL, [leagueId, pickNumber]);

  if (!row) {
    throw new Error(`Draft pick not found for league ${leagueId}, pick ${pickNumber}`);
  }

  return {
    pickId: row.pickId as string,
    leagueId: row.leagueId as string,
    pickNumber: row.pickNumber as number,
    round: row.round as number,
    teamId: row.teamId as string,
    playerId: row.playerId as string,
    pickTimestamp: row.pickTimestamp as string,
    createdAt: row.createdAt as string
  };
}

/**
 * Advances the draft to the next pick
 */
export async function advanceDraftToNextPick(leagueId: string): Promise<DraftState> {
  const draftState = await getDraftState(leagueId);
  if (!draftState) {
    throw new Error(`Draft state not found for league ${leagueId}`);
  }

  const nextPickNumber = draftState.currentPickNumber + 1;
  const isComplete = nextPickNumber > draftState.totalPicks;
  
  let updatedState: Partial<DraftState>;

  if (isComplete) {
    // Draft is complete
    updatedState = {
      isComplete: true,
      draftCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else {
    // Move to next pick
    const nextPickInfo = getTeamForPick(draftState.draftOrder, nextPickNumber);
    updatedState = {
      currentPickNumber: nextPickNumber,
      currentRound: nextPickInfo.round,
      currentTeamId: nextPickInfo.teamId,
      updatedAt: new Date().toISOString()
    };
  }

  // Update draft state
  const updateFields = Object.keys(updatedState).map(key => `${key} = ?`).join(', ');
  const updateValues = Object.values(updatedState);
  
  const updateSQL = `UPDATE DraftStates SET ${updateFields} WHERE leagueId = ?`;
  await run(updateSQL, [...updateValues, leagueId]);

  // Return updated state
  return { ...draftState, ...updatedState };
}

/**
 * Gets all drafted player IDs for a league
 */
export async function getDraftedPlayerIds(leagueId: string): Promise<string[]> {
  const sql = `SELECT playerId FROM DraftPicks WHERE leagueId = ? AND playerId IS NOT NULL`;
  const rows = await all<{ playerId: string }>(sql, [leagueId]);
  return rows.map(row => row.playerId);
}
