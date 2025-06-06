/**
 * Data Transfer Objects for Standings API endpoints
 * Based on Story 1.13 requirements for league standings display
 */

// Team Standing DTO for API responses
export interface TeamStandingDto {
  teamId: string;
  teamName: string;
  userId: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  winPercentage: number;
  rank: number;
}

// Main Standings Response DTO
export interface GetStandingsResponseDto {
  leagueInfo: {
    leagueId: string;
    leagueName: string;
    currentSeasonWeek: number;
    numberOfTeams: number;
  };
  standings: TeamStandingDto[];
  isPoC: boolean; // Indicates this is PoC data
}

// Error Response DTO
export interface StandingsErrorResponseDto {
  error: string;
  details?: string;
}
