/**
 * Frontend Draft API Service
 * Handles API calls for draft functionality from the frontend
 */

import { GetDraftStateResponseDto, MakeDraftPickRequestDto, MakeDraftPickResponseDto } from '../dtos/draft.dto';

export class DraftApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'DraftApiError';
  }
}

/**
 * Gets the current draft state for a league
 */
export async function getDraftState(leagueId: string): Promise<GetDraftStateResponseDto> {
  try {
    const response = await fetch(`/api/leagues/${leagueId}/draft`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new DraftApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof DraftApiError) {
      throw error;
    }
    
    console.error('Failed to get draft state:', error);
    throw new DraftApiError('Failed to connect to server', 0);
  }
}

/**
 * Starts a draft for a league (commissioner only)
 */
export async function startDraft(leagueId: string): Promise<GetDraftStateResponseDto> {
  try {
    const response = await fetch(`/api/leagues/${leagueId}/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new DraftApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof DraftApiError) {
      throw error;
    }
    
    console.error('Failed to start draft:', error);
    throw new DraftApiError('Failed to connect to server', 0);
  }
}

/**
 * Makes a draft pick
 */
export async function makeDraftPick(
  leagueId: string, 
  playerId: string
): Promise<MakeDraftPickResponseDto> {
  try {
    const requestBody: MakeDraftPickRequestDto = { playerId };
    
    const response = await fetch(`/api/leagues/${leagueId}/draft/pick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new DraftApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof DraftApiError) {
      throw error;
    }
    
    console.error('Failed to make draft pick:', error);
    throw new DraftApiError('Failed to connect to server', 0);
  }
}

/**
 * Gets NFL players with optional filtering
 */
export async function getNFLPlayers(options?: {
  position?: string;
  search?: string;
  limit?: number;
}): Promise<{
  players: Array<{
    playerId: string;
    fullName: string;
    position: string;
    nflTeamAbbreviation: string;
    status: string;
    projectedPoints: number;
  }>;
}> {
  try {
    const params = new URLSearchParams();
    if (options?.position) params.append('position', options.position);
    if (options?.search) params.append('search', options.search);
    if (options?.limit) params.append('limit', options.limit.toString());

    const queryString = params.toString();
    const url = `/api/players${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new DraftApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof DraftApiError) {
      throw error;
    }
    
    console.error('Failed to get NFL players:', error);
    throw new DraftApiError('Failed to connect to server', 0);
  }
}

/**
 * Gets multiple NFL players by their IDs
 */
export async function getNFLPlayersByIds(playerIds: string[]): Promise<{
  players: Array<{
    playerId: string;
    fullName: string;
    position: string;
    nflTeamAbbreviation: string;
    status: string;
    projectedPoints: number;
  }>;
}> {
  try {
    if (playerIds.length === 0) {
      return { players: [] };
    }

    const response = await fetch('/api/players/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new DraftApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof DraftApiError) {
      throw error;
    }
    
    console.error('Failed to get NFL players by IDs:', error);
    throw new DraftApiError('Failed to connect to server', 0);
  }
}

/**
 * Utility function to check if an error is a DraftApiError
 */
export function isDraftApiError(error: unknown): error is DraftApiError {
  return error instanceof DraftApiError;
}

/**
 * Utility function to get a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isDraftApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
