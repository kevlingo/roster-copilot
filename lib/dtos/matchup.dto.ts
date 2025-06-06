/**
 * Data Transfer Objects for Matchup API endpoints
 * Based on Story 1.12 requirements for displaying fantasy scores
 */

// NFL Game DTOs
export interface NFLGameDto {
  gameId: string;
  weekNumber: number;
  homeTeamAbbreviation: string;
  awayTeamAbbreviation: string;
  homeScore?: number;
  awayScore?: number;
  gameStatus?: "Scheduled" | "InProgress" | "Final";
  gameDateTime_ISO?: string;
}

// Fantasy Player DTOs
export interface FantasyPlayerDto {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: string;
  projectedPoints: number;
  opponent?: string;
  gameTime?: string;
}

// Fantasy Team DTOs
export interface FantasyTeamDto {
  teamId: string;
  teamName: string;
  userId: string;
  totalFantasyPoints: number;
  starters: FantasyPlayerDto[];
}

// Fantasy Matchup DTOs
export interface FantasyMatchupDto {
  userTeam: FantasyTeamDto;
  opponentTeam: FantasyTeamDto;
  weekNumber: number;
  matchupStatus: "Scheduled" | "InProgress" | "Final";
}

// Main Response DTO
export interface GetMatchupsResponseDto {
  leagueInfo: {
    leagueId: string;
    leagueName: string;
    currentSeasonWeek: number;
  };
  weekNumber: number;
  nflScoreboard: NFLGameDto[];
  fantasyMatchup: FantasyMatchupDto;
  isPoC: boolean; // Indicates this is PoC static data
}

// Error Response DTO
export interface MatchupErrorResponseDto {
  error: string;
  details?: string;
}
