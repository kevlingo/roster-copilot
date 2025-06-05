/**
 * Draft API Data Transfer Objects
 * Based on Story 1.8 requirements and API specifications
 */

export interface DraftStateDto {
  leagueId: string;
  draftOrder: string[]; // Array of teamIds in draft order
  currentPickNumber: number;
  currentRound: number;
  currentTeamId: string;
  isComplete: boolean;
  draftStartedAt?: string;
  draftCompletedAt?: string;
  totalPicks: number;
  totalRounds: number;
}

export interface DraftPickDto {
  pickId: string;
  pickNumber: number;
  round: number;
  teamId: string;
  playerId?: string;
  pickTimestamp?: string;
}

export interface CurrentPickerDto {
  teamId: string;
  teamName: string;
  isUserTurn: boolean;
}

export interface UserTeamDto {
  teamId: string;
  teamName: string;
  currentRoster: string[]; // Player IDs on user's roster
}

export interface GetDraftStateResponseDto {
  draftStatus: "Scheduled" | "InProgress" | "Completed";
  draftState?: DraftStateDto;
  draftPicks?: DraftPickDto[];
  availablePlayerIds?: string[];
  userTeam?: UserTeamDto;
  currentPicker?: CurrentPickerDto;
  timeRemaining?: number; // Future enhancement
  canStart?: boolean; // For Scheduled status
  reason?: string; // For Scheduled status when canStart is false
  message?: string;
}

export interface MakeDraftPickRequestDto {
  playerId: string;
}

export interface MakeDraftPickResponseDto {
  success: boolean;
  message?: string;
  pick: {
    pickId: string;
    pickNumber: number;
    round: number;
    teamId: string;
    playerId: string;
    pickTimestamp: string;
  };
  draftState: {
    currentPickNumber: number;
    currentRound: number;
    currentTeamId: string;
    isComplete: boolean;
    draftCompletedAt?: string;
  };
}

export interface StartDraftResponseDto {
  message: string;
  draftStatus: "InProgress";
  draftState: DraftStateDto;
  draftPicks: DraftPickDto[];
  availablePlayerIds: string[];
  userTeam?: UserTeamDto;
  currentPicker?: CurrentPickerDto;
}
