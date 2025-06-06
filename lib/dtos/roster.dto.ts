/**
 * Data Transfer Objects for Roster Management Operations
 * Used for add/drop player functionality and available players
 */

// ===== AVAILABLE PLAYERS DTOs =====

export interface GetAvailablePlayersResponseDto {
  players: AvailablePlayerDto[];
  total: number;
  filters: {
    position: string | null;
    search: string | null;
    limit: number | null;
  };
}

export interface AvailablePlayerDto {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: string;
  projectedPoints: number;
}

// ===== ADD PLAYER DTOs =====

export interface AddPlayerRequestDto {
  playerIdToAdd: string;
  playerIdToDrop?: string; // Optional - only required if roster is full
}

export interface AddPlayerResponseDto {
  success: boolean;
  message: string;
  transaction: {
    addedPlayer: {
      playerId: string;
      fullName: string;
      position: string;
    };
    droppedPlayer?: {
      playerId: string;
      fullName: string;
      position: string;
    };
  };
  updatedRosterCount: number;
}

// ===== DROP PLAYER DTOs =====

export interface DropPlayerRequestDto {
  playerIdToDrop: string;
}

export interface DropPlayerResponseDto {
  success: boolean;
  message: string;
  droppedPlayer: {
    playerId: string;
    fullName: string;
    position: string;
  };
  updatedRosterCount: number;
}

// ===== ERROR DTOs =====

export interface RosterErrorDto {
  error: string;
  code?: 'PLAYER_NOT_FOUND' | 'PLAYER_ALREADY_OWNED' | 'ROSTER_FULL' | 'PLAYER_NOT_ON_ROSTER' | 'INVALID_TRANSACTION';
  details?: string;
}
