/**
 * Draft Service Layer
 * Handles business logic for draft operations
 */

import { 
  initializeDraft, 
  getDraftState, 
  getDraftPicks, 
  makeDraftPick as dalMakeDraftPick,
  advanceDraftToNextPick,
  getDraftedPlayerIds
} from '../dal/draft.dal';
import { 
  getLeagueById, 
  getFantasyTeamsByLeagueId, 
  updateLeagueDraftStatus,
  getFantasyTeamByUserAndLeague,
  addPlayerToTeamRoster
} from '../dal/league.dal';
import { getAllNFLPlayers } from '../dal/player.dal';
import { DraftStateResponse, MakeDraftPickRequest, MakeDraftPickResponse } from '../models/draft.models';

/**
 * Starts a draft for a league
 * Updates league status to "InProgress" and initializes draft state
 */
export async function startDraft(leagueId: string): Promise<DraftStateResponse> {
  // Get league and validate
  const league = await getLeagueById(leagueId);
  if (!league) {
    throw new Error('League not found');
  }

  if (league.draftStatus !== 'Scheduled') {
    throw new Error(`Cannot start draft. Current status: ${league.draftStatus}`);
  }

  // Get teams in the league
  const teams = await getFantasyTeamsByLeagueId(leagueId);
  if (teams.length !== league.numberOfTeams) {
    throw new Error(`Cannot start draft. Expected ${league.numberOfTeams} teams, found ${teams.length}`);
  }

  // Initialize draft
  await initializeDraft(league, teams);

  // Update league status
  await updateLeagueDraftStatus(leagueId, 'InProgress');

  // Return initial draft state
  return await getDraftStateForResponse(leagueId);
}

/**
 * Gets the current draft state for API response
 */
export async function getDraftStateForResponse(
  leagueId: string, 
  userId?: string
): Promise<DraftStateResponse> {
  const draftState = await getDraftState(leagueId);
  if (!draftState) {
    throw new Error('Draft not found for this league');
  }

  const draftPicks = await getDraftPicks(leagueId);
  const draftedPlayerIds = await getDraftedPlayerIds(leagueId);
  
  // Get all available players (not drafted)
  const allPlayers = await getAllNFLPlayers();
  const availablePlayerIds = allPlayers
    .filter(player => !draftedPlayerIds.includes(player.playerId))
    .map(player => player.playerId);

  // Get user's team info if userId provided
  let userTeam;
  if (userId) {
    const team = await getFantasyTeamByUserAndLeague(userId, leagueId);
    if (team) {
      userTeam = {
        teamId: team.teamId,
        teamName: team.teamName,
        currentRoster: team.playerIds_onRoster
      };
    }
  }

  // Get current picker info
  const teams = await getFantasyTeamsByLeagueId(leagueId);
  const currentTeam = teams.find(team => team.teamId === draftState.currentTeamId);
  const currentPicker = currentTeam ? {
    teamId: currentTeam.teamId,
    teamName: currentTeam.teamName,
    isUserTurn: userId ? currentTeam.userId === userId : false
  } : undefined;

  return {
    draftState,
    draftPicks,
    availablePlayerIds,
    userTeam,
    currentPicker
  };
}

/**
 * Makes a draft pick for a user
 */
export async function makeUserDraftPick(
  leagueId: string,
  userId: string,
  request: MakeDraftPickRequest
): Promise<MakeDraftPickResponse> {
  const { playerId } = request;

  // Get draft state
  const draftState = await getDraftState(leagueId);
  if (!draftState) {
    throw new Error('Draft not found for this league');
  }

  if (draftState.isComplete) {
    throw new Error('Draft is already complete');
  }

  // Validate it's the user's turn
  const userTeam = await getFantasyTeamByUserAndLeague(userId, leagueId);
  if (!userTeam) {
    throw new Error('User is not part of this league');
  }

  if (userTeam.teamId !== draftState.currentTeamId) {
    throw new Error('It is not your turn to pick');
  }

  // Validate player is available
  const draftedPlayerIds = await getDraftedPlayerIds(leagueId);
  if (draftedPlayerIds.includes(playerId)) {
    throw new Error('Player has already been drafted');
  }

  // Validate player exists
  const allPlayers = await getAllNFLPlayers();
  const player = allPlayers.find(p => p.playerId === playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  try {
    // Make the pick
    const pick = await dalMakeDraftPick(leagueId, draftState.currentPickNumber, playerId);

    // Add player to team roster
    await addPlayerToTeamRoster(userTeam.teamId, playerId);

    // Advance to next pick
    const updatedDraftState = await advanceDraftToNextPick(leagueId);

    // If draft is complete, update league status
    if (updatedDraftState.isComplete) {
      await updateLeagueDraftStatus(leagueId, 'Completed');
    }

    return {
      success: true,
      pick,
      updatedDraftState,
      message: `Successfully drafted ${player.fullName}`
    };

  } catch (error) {
    console.error('Error making draft pick:', error);
    throw new Error('Failed to make draft pick. Please try again.');
  }
}

/**
 * Validates if a draft can be started for a league
 */
export async function validateDraftStart(leagueId: string): Promise<{
  canStart: boolean;
  reason?: string;
}> {
  const league = await getLeagueById(leagueId);
  if (!league) {
    return { canStart: false, reason: 'League not found' };
  }

  if (league.draftStatus !== 'Scheduled') {
    return { canStart: false, reason: `Draft status is ${league.draftStatus}` };
  }

  const teams = await getFantasyTeamsByLeagueId(leagueId);
  if (teams.length !== league.numberOfTeams) {
    return { 
      canStart: false, 
      reason: `Need ${league.numberOfTeams} teams, currently have ${teams.length}` 
    };
  }

  return { canStart: true };
}

/**
 * Gets draft picks for a specific team
 */
export async function getTeamDraftPicks(leagueId: string, teamId: string): Promise<{
  picks: Array<{ pickNumber: number; round: number; playerId?: string; playerName?: string }>;
}> {
  const draftPicks = await getDraftPicks(leagueId);
  const teamPicks = draftPicks.filter(pick => pick.teamId === teamId);

  // Get player names for completed picks
  const allPlayers = await getAllNFLPlayers();
  const picks = teamPicks.map(pick => {
    const player = pick.playerId ? allPlayers.find(p => p.playerId === pick.playerId) : undefined;
    return {
      pickNumber: pick.pickNumber,
      round: pick.round,
      playerId: pick.playerId,
      playerName: player?.fullName
    };
  });

  return { picks };
}
