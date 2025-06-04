/**
 * League and Fantasy Team data models for Roster Copilot PoC
 * Based on docs/data-models.md specifications
 */

export interface League_PoC {
  leagueId: string;
  leagueName: string;
  commissionerUserId: string;
  numberOfTeams: 8 | 10 | 12;
  scoringType: "Standard" | "PPR";
  draftStatus: "Scheduled" | "InProgress" | "Completed";
  currentSeasonWeek: number;
  participatingTeamIds?: string[]; // Array of FantasyTeam_PoC IDs
  rosterSettings?: {
    QB: number;
    RB: number;
    WR: number;
    TE: number;
    K: number;
    DEF: number;
    BENCH: number;
  };
  createdAt: string;
}

export interface FantasyTeam_PoC {
  teamId: string;
  leagueId: string;
  userId: string;
  teamName: string;
  playerIds_onRoster: string[]; // Array of NFLPlayer IDs
  createdAt: string;
}

// Default roster settings for PoC
export const DEFAULT_ROSTER_SETTINGS = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  K: 1,
  DEF: 1,
  BENCH: 6
} as const;
