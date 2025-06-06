/**
 * Data Transfer Objects for Weekly Lineup API endpoints
 * Based on docs/data-models.md specifications
 */

export interface GetLineupResponseDto {
  teamInfo: {
    teamId: string;
    teamName: string;
    leagueId: string;
    leagueName: string;
  };
  weekNumber: number;
  lineup: {
    starters: LineupPlayerDto[];
    bench: LineupPlayerDto[];
  };
  rosterSettings: {
    QB: number;
    RB: number;
    WR: number;
    TE: number;
    K: number;
    DEF: number;
    BENCH: number;
  };
  hasExistingLineup: boolean;
}

export interface LineupPlayerDto {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: string;
  projectedPoints: number;
  opponent?: string;
  gameTime?: string;
}

export interface SaveLineupRequestDto {
  weekNumber: number;
  starterPlayerIds: string[];
  benchPlayerIds: string[];
}

export interface SaveLineupResponseDto {
  success: boolean;
  message: string;
  lineup: {
    lineupId: string;
    weekNumber: number;
    starterPlayerIds: string[];
    benchPlayerIds: string[];
    updatedAt: string;
  };
}

export interface LineupValidationError {
  field: string;
  message: string;
  playerId?: string;
}

export interface LineupValidationResult {
  isValid: boolean;
  errors: LineupValidationError[];
}
