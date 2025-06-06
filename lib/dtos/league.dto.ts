/**
 * League API Data Transfer Objects
 * Based on docs/data-models.md API Payload Schemas
 */

export interface CreateLeagueDto {
  leagueName: string;
  numberOfTeams: 8 | 10 | 12;
  scoringType: "Standard" | "PPR";
}

export interface CreateLeagueResponseDto {
  leagueId: string;
  leagueName: string;
  commissionerUserId: string;
  numberOfTeams: 8 | 10 | 12;
  scoringType: "Standard" | "PPR";
  draftStatus: "Scheduled" | "InProgress" | "Completed";
  currentSeasonWeek: number;
  participatingTeamIds: string[];
  rosterSettings: {
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

export interface JoinLeagueResponseDto {
  message: string;
  league: {
    leagueId: string;
    leagueName: string;
    numberOfTeams: number;
    currentTeamCount: number;
  };
  team: {
    teamId: string;
    teamName: string;
    userId: string;
  };
}
