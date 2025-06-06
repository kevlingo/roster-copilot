/**
 * React Hook for NFL Players Data Management
 * Handles fetching and filtering NFL players
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getNFLPlayers, 
  getNFLPlayersByIds,
  getErrorMessage 
} from '../services/draft-api.service';

interface NFLPlayer {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: string;
  projectedPoints: number;
}

interface UseNFLPlayersOptions {
  availablePlayerIds?: string[]; // Filter to only show available players
  initialPosition?: string; // Initial position filter
  autoFetch?: boolean; // Auto-fetch on mount, default true
}

interface UseNFLPlayersReturn {
  // State
  allPlayers: NFLPlayer[];
  filteredPlayers: NFLPlayer[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  positionFilter: string;
  searchFilter: string;
  
  // Actions
  setPositionFilter: (position: string) => void;
  setSearchFilter: (search: string) => void;
  refreshPlayers: () => Promise<void>;
  getPlayerById: (playerId: string) => NFLPlayer | undefined;
  getPlayersByIds: (playerIds: string[]) => Promise<NFLPlayer[]>;
  
  // Computed values
  availablePositions: string[];
  playerCount: number;
}

export function useNFLPlayers({
  availablePlayerIds,
  initialPosition = '',
  autoFetch = true
}: UseNFLPlayersOptions = {}): UseNFLPlayersReturn {
  const [allPlayers, setAllPlayers] = useState<NFLPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState(initialPosition);
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch all players
  const fetchPlayers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getNFLPlayers();
      setAllPlayers(response.players);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch NFL players:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get players by IDs
  const getPlayersByIds = useCallback(async (playerIds: string[]): Promise<NFLPlayer[]> => {
    try {
      const response = await getNFLPlayersByIds(playerIds);
      return response.players;
    } catch (err) {
      console.error('Failed to fetch players by IDs:', err);
      return [];
    }
  }, []);

  // Get single player by ID
  const getPlayerById = useCallback((playerId: string): NFLPlayer | undefined => {
    return allPlayers.find(player => player.playerId === playerId);
  }, [allPlayers]);

  // Refresh players
  const refreshPlayers = useCallback(async () => {
    await fetchPlayers();
  }, [fetchPlayers]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPlayers();
    }
  }, [autoFetch, fetchPlayers]);

  // Filter players based on availability, position, and search
  const filteredPlayers = useMemo(() => {
    let players = allPlayers;

    // Filter by availability if provided
    if (availablePlayerIds) {
      players = players.filter(player => 
        availablePlayerIds.includes(player.playerId)
      );
    }

    // Filter by position
    if (positionFilter && positionFilter !== 'ALL') {
      players = players.filter(player => 
        player.position === positionFilter
      );
    }

    // Filter by search term
    if (searchFilter.trim()) {
      const searchTerm = searchFilter.toLowerCase().trim();
      players = players.filter(player =>
        player.fullName.toLowerCase().includes(searchTerm) ||
        player.nflTeamAbbreviation.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by projected points (descending) then by name
    return players.sort((a, b) => {
      if (b.projectedPoints !== a.projectedPoints) {
        return b.projectedPoints - a.projectedPoints;
      }
      return a.fullName.localeCompare(b.fullName);
    });
  }, [allPlayers, availablePlayerIds, positionFilter, searchFilter]);

  // Get available positions from all players
  const availablePositions = useMemo(() => {
    const positions = new Set(allPlayers.map(player => player.position));
    return ['ALL', ...Array.from(positions).sort()];
  }, [allPlayers]);

  // Player count
  const playerCount = filteredPlayers.length;

  return {
    // State
    allPlayers,
    filteredPlayers,
    isLoading,
    error,
    
    // Filters
    positionFilter,
    searchFilter,
    
    // Actions
    setPositionFilter,
    setSearchFilter,
    refreshPlayers,
    getPlayerById,
    getPlayersByIds,
    
    // Computed values
    availablePositions,
    playerCount
  };
}
