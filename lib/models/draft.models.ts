/**
 * Draft-related data models for Roster Copilot PoC
 * Based on Story 1.8 requirements and docs/data-models.md specifications
 */

export interface DraftPick {
  pickId: string;
  leagueId: string;
  pickNumber: number; // Overall pick number (1, 2, 3, ...)
  round: number;
  teamId: string;
  playerId?: string; // undefined if pick hasn't been made yet
  pickTimestamp?: string; // ISO string when pick was made
  createdAt: string;
}

export interface DraftState {
  leagueId: string;
  draftOrder: string[]; // Array of teamIds in draft order
  currentPickNumber: number; // Current overall pick number
  currentRound: number;
  currentTeamId: string; // Team currently on the clock
  isComplete: boolean;
  draftStartedAt?: string; // ISO string when draft was started
  draftCompletedAt?: string; // ISO string when draft was completed
  totalPicks: number; // Total picks in the draft (numberOfTeams * rounds)
  totalRounds: number; // Total rounds in the draft
  createdAt: string;
  updatedAt: string;
}

export interface DraftStateResponse {
  draftState: DraftState;
  draftPicks: DraftPick[];
  availablePlayerIds: string[]; // Player IDs that haven't been drafted
  userTeam?: {
    teamId: string;
    teamName: string;
    currentRoster: string[]; // Player IDs on user's roster
  };
  currentPicker?: {
    teamId: string;
    teamName: string;
    isUserTurn: boolean;
  };
  timeRemaining?: number; // Seconds remaining for current pick (future enhancement)
}

export interface MakeDraftPickRequest {
  playerId: string;
}

export interface MakeDraftPickResponse {
  success: boolean;
  pick: DraftPick;
  updatedDraftState: DraftState;
  message?: string;
}

/**
 * Helper function to calculate snake draft order for a given round
 * @param teams Array of team IDs in original draft order
 * @param round Round number (1-based)
 * @returns Array of team IDs in the order they pick for that round
 */
export function getSnakeDraftOrder(teams: string[], round: number): string[] {
  // Odd rounds (1, 3, 5, ...): normal order
  // Even rounds (2, 4, 6, ...): reverse order
  return round % 2 === 1 ? [...teams] : [...teams].reverse();
}

/**
 * Helper function to calculate which team picks at a given overall pick number
 * @param teams Array of team IDs in original draft order
 * @param pickNumber Overall pick number (1-based)
 * @returns Object with teamId, round, and position in round
 */
export function getTeamForPick(teams: string[], pickNumber: number): {
  teamId: string;
  round: number;
  positionInRound: number;
} {
  const numberOfTeams = teams.length;
  const round = Math.ceil(pickNumber / numberOfTeams);
  const positionInRound = ((pickNumber - 1) % numberOfTeams) + 1;
  
  const roundOrder = getSnakeDraftOrder(teams, round);
  const teamId = roundOrder[positionInRound - 1];
  
  return {
    teamId,
    round,
    positionInRound
  };
}

/**
 * Helper function to calculate total picks in a draft
 * @param numberOfTeams Number of teams in the league
 * @param rosterSettings Roster settings defining how many players each team drafts
 * @returns Total number of picks in the draft
 */
export function calculateTotalPicks(
  numberOfTeams: number, 
  rosterSettings: { QB: number; RB: number; WR: number; TE: number; K: number; DEF: number; BENCH: number }
): number {
  const playersPerTeam = Object.values(rosterSettings).reduce((sum, count) => sum + count, 0);
  return numberOfTeams * playersPerTeam;
}
