/**
 * React Hook for Draft State Management
 * Handles draft state fetching, polling, and updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getDraftState,
  makeDraftPick,
  startDraft,
  getErrorMessage
} from '../services/draft-api.service';
import { GetDraftStateResponseDto, MakeDraftPickResponseDto } from '../dtos/draft.dto';

interface UseDraftStateOptions {
  leagueId: string;
  pollingInterval?: number; // milliseconds, default 3000 (3 seconds)
  enablePolling?: boolean; // default true
}

interface UseDraftStateReturn {
  // State
  draftData: GetDraftStateResponseDto | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  
  // Actions
  refreshDraftState: () => Promise<void>;
  makePickAction: (playerId: string) => Promise<MakeDraftPickResponseDto>;
  startDraftAction: () => Promise<void>;
  
  // Polling controls
  startPolling: () => void;
  stopPolling: () => void;
  
  // Computed values
  isUserTurn: boolean;
  canStartDraft: boolean;
  isDraftComplete: boolean;
  currentPickNumber: number | null;
  currentRound: number | null;
}

export function useDraftState({
  leagueId,
  pollingInterval = 3000,
  enablePolling = true
}: UseDraftStateOptions): UseDraftStateReturn {
  const [draftData, setDraftData] = useState<GetDraftStateResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Fetch draft state
  const fetchDraftState = useCallback(async (showLoading = true) => {
    if (!isMountedRef.current) return;
    
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      const data = await getDraftState(leagueId);
      
      if (isMountedRef.current) {
        setDraftData(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        console.error('Failed to fetch draft state:', err);
      }
    } finally {
      if (isMountedRef.current && showLoading) {
        setIsLoading(false);
      }
    }
  }, [leagueId]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current || !enablePolling) return;
    
    setIsPolling(true);
    pollingIntervalRef.current = setInterval(() => {
      fetchDraftState(false); // Don't show loading for polling updates
    }, pollingInterval);
  }, [fetchDraftState, pollingInterval, enablePolling]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Refresh draft state manually
  const refreshDraftState = useCallback(async () => {
    await fetchDraftState(true);
  }, [fetchDraftState]);

  // Make a draft pick
  const makePickAction = useCallback(async (playerId: string): Promise<MakeDraftPickResponseDto> => {
    try {
      setError(null);
      const result = await makeDraftPick(leagueId, playerId);
      
      // Refresh draft state after successful pick
      await fetchDraftState(false);
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  }, [leagueId, fetchDraftState]);

  // Start draft
  const startDraftAction = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const result = await startDraft(leagueId);
      
      if (isMountedRef.current) {
        setDraftData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [leagueId]);

  // Initial fetch and polling setup
  useEffect(() => {
    fetchDraftState(true);
  }, [fetchDraftState]);

  // Auto-start polling for in-progress drafts
  useEffect(() => {
    if (draftData?.draftStatus === 'InProgress' && enablePolling && !isPolling) {
      startPolling();
    } else if (draftData?.draftStatus !== 'InProgress' && isPolling) {
      stopPolling();
    }
  }, [draftData?.draftStatus, enablePolling, isPolling, startPolling, stopPolling]);

  // Computed values
  const isUserTurn = draftData?.currentPicker?.isUserTurn ?? false;
  const canStartDraft = draftData?.canStart ?? false;
  const isDraftComplete = draftData?.draftState?.isComplete ?? false;
  const currentPickNumber = draftData?.draftState?.currentPickNumber ?? null;
  const currentRound = draftData?.draftState?.currentRound ?? null;

  return {
    // State
    draftData,
    isLoading,
    error,
    isPolling,
    
    // Actions
    refreshDraftState,
    makePickAction,
    startDraftAction,
    
    // Polling controls
    startPolling,
    stopPolling,
    
    // Computed values
    isUserTurn,
    canStartDraft,
    isDraftComplete,
    currentPickNumber,
    currentRound
  };
}
