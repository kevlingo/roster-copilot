/**
 * Data Transfer Objects for Schedule API endpoints
 * Based on Story 1.13 requirements for league schedule display
 */

// Team info for schedule display
export interface ScheduleTeamDto {
  teamId: string;
  teamName: string;
  userId: string;
}

// Matchup DTO for schedule display
export interface ScheduleMatchupDto {
  weekNumber: number;
  team1: ScheduleTeamDto;
  team2: ScheduleTeamDto;
  team1Score?: number;
  team2Score?: number;
  isCompleted: boolean;
  isUserTeamInvolved: boolean; // Helps highlight user's matchups
  winner?: 'team1' | 'team2' | 'tie';
}

// Weekly schedule DTO
export interface WeeklyScheduleDto {
  weekNumber: number;
  matchups: ScheduleMatchupDto[];
  isCompleted: boolean;
}

// Main Schedule Response DTO
export interface GetScheduleResponseDto {
  leagueInfo: {
    leagueId: string;
    leagueName: string;
    currentSeasonWeek: number;
    numberOfTeams: number;
  };
  userTeamId?: string; // For highlighting user's matchups
  weeks: WeeklyScheduleDto[];
  totalWeeks: number;
  isPoC: boolean; // Indicates this is PoC data
}

// Error Response DTO
export interface ScheduleErrorResponseDto {
  error: string;
  details?: string;
}
