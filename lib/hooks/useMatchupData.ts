/**
 * Custom hook for fetching matchup data
 * Handles API calls to get NFL scoreboard and fantasy matchup information
 */

import { useState, useEffect, useCallback } from 'react';
import { GetMatchupsResponseDto, MatchupErrorResponseDto } from '@/lib/dtos/matchup.dto';
import { useAuthStore } from '@/lib/store/auth.store';

interface UseMatchupDataProps {
  leagueId: string;
  weekNumber: number;
  enabled?: boolean;
}

interface UseMatchupDataReturn {
  data: GetMatchupsResponseDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMatchupData({
  leagueId,
  weekNumber,
  enabled = true
}: UseMatchupDataProps): UseMatchupDataReturn {
  const [data, setData] = useState<GetMatchupsResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  const fetchMatchupData = useCallback(async () => {
    if (!enabled || !leagueId || !weekNumber || !token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/leagues/${leagueId}/matchups?week=${weekNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData: MatchupErrorResponseDto = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const matchupData: GetMatchupsResponseDto = await response.json();
      setData(matchupData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch matchup data';
      setError(errorMessage);
      console.error('Error fetching matchup data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, leagueId, weekNumber, token]);

  const refetch = () => {
    fetchMatchupData();
  };

  useEffect(() => {
    fetchMatchupData();
  }, [fetchMatchupData]);

  return {
    data,
    isLoading,
    error,
    refetch
  };
}
