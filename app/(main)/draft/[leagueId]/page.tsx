'use client';

import React, { useState, useEffect } from 'react';
import DraftPlayerCard from '@/src/components/draft/DraftPlayerCard';
import DraftBoard from '@/src/components/draft/DraftBoard';
import PlayerRosterCard from '@/src/components/roster/PlayerRosterCard';
import { useDraftState } from '@/lib/hooks/useDraftState';
import { useNFLPlayers } from '@/lib/hooks/useNFLPlayers';
import { getErrorMessage } from '@/lib/services/draft-api.service';

// Updated interfaces to match API responses

interface Team {
  teamId: string;
  name: string;
  owner: string;
}

interface DraftPick {
  pickNumber: number;
  round: number;
  teamId: string;
  playerId?: string;
  playerName?: string;
  position?: string;
}

interface PageProps {
  params: {
    leagueId: string;
  };
}

export default function DraftPage({ params }: PageProps) {
  const { leagueId } = params;
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPickingPlayer, setIsPickingPlayer] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);

  // Use draft state hook with polling
  const {
    draftData,
    isLoading: isDraftLoading,
    error: draftError,
    isPolling,
    makePickAction,
    startDraftAction,
    refreshDraftState,
    isUserTurn,
    canStartDraft,
    isDraftComplete,
    currentPickNumber,
    currentRound
  } = useDraftState({ leagueId });

  // Use NFL players hook with available players filter
  const {
    filteredPlayers,
    isLoading: isPlayersLoading,
    error: playersError,
    setPositionFilter: setPlayerPositionFilter,
    setSearchFilter,
    availablePositions,
    playerCount,
    getPlayerById
  } = useNFLPlayers({
    availablePlayerIds: draftData?.availablePlayerIds,
    autoFetch: true
  });

  // Update filters when user changes selection
  useEffect(() => {
    setPlayerPositionFilter(positionFilter);
  }, [positionFilter, setPlayerPositionFilter]);

  useEffect(() => {
    setSearchFilter(searchQuery);
  }, [searchQuery, setSearchFilter]);

  // Handle draft pick
  const handleDraftPlayer = async (playerId: string) => {
    if (!isUserTurn || isPickingPlayer) return;

    setIsPickingPlayer(true);
    setPickError(null);

    try {
      await makePickAction(playerId);
      // Success - the hook will automatically refresh the draft state
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setPickError(errorMessage);
      console.error('Failed to make draft pick:', error);
    } finally {
      setIsPickingPlayer(false);
    }
  };

  // Handle start draft
  const handleStartDraft = async () => {
    if (!canStartDraft) return;

    try {
      await startDraftAction();
    } catch (error) {
      console.error('Failed to start draft:', error);
      // Error is handled by the hook
    }
  };

  // Transform draft data for display
  const transformedDraftPicks: DraftPick[] = draftData?.draftPicks?.map(pick => ({
    pickNumber: pick.pickNumber,
    round: pick.round,
    teamId: pick.teamId,
    playerId: pick.playerId,
    playerName: pick.playerId ? getPlayerById(pick.playerId)?.fullName : undefined,
    position: pick.playerId ? getPlayerById(pick.playerId)?.position : undefined
  })) || [];

  // Get user's team roster with proper type casting
  const userTeam = draftData?.userTeam?.currentRoster?.map(playerId => {
    const player = getPlayerById(playerId);
    if (!player) return null;

    // Cast status to match RosterPlayer interface
    const status = ['Active', 'Injured_Out', 'Injured_IR', 'Bye_Week'].includes(player.status)
      ? player.status as 'Active' | 'Injured_Out' | 'Injured_IR' | 'Bye_Week'
      : 'Active';

    return {
      ...player,
      status
    };
  }).filter(Boolean) || [];

  // Create teams data for display
  const teams: Team[] = draftData?.draftState?.draftOrder.map((teamId, index) => ({
    teamId,
    name: teamId === draftData?.userTeam?.teamId ? draftData.userTeam.teamName : `Team ${index + 1}`,
    owner: teamId === draftData?.userTeam?.teamId ? 'You' : `Player ${index + 1}`
  })) || [];

  // Show loading state
  if (isDraftLoading && !draftData) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">Draft Room - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>
    );
  }

  // Show error state
  if (draftError && !draftData) {
    return (
      <div className="page-container space-y-6">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Draft</h2>
          <p className="text-gray-600 mb-4">{draftError}</p>
          <button
            onClick={refreshDraftState}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show draft not started state
  if (draftData?.draftStatus === 'Scheduled') {
    return (
      <div className="page-container space-y-6">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-semibold mb-4">Draft Not Started</h2>
          {canStartDraft ? (
            <div>
              <p className="text-gray-600 mb-4">The draft is ready to begin!</p>
              <button
                onClick={handleStartDraft}
                className="btn btn-success btn-lg"
              >
                Start Draft
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">Waiting for the commissioner to start the draft.</p>
              {draftData.reason && (
                <p className="text-sm text-red-600">{draftData.reason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Draft Room: {leagueId}</h1>
        <div className="flex items-center gap-4">
          {isPolling && (
            <div className="badge badge-success">
              <span className="loading loading-dots loading-xs mr-1"></span>
              Live
            </div>
          )}
          <div className="badge badge-primary p-3">
            Pick {currentPickNumber || 0} - Round {currentRound || 1}
            {isUserTurn && <span className="ml-2 font-bold">YOUR TURN!</span>}
          </div>
          {isDraftComplete && (
            <div className="badge badge-success p-3">
              DRAFT COMPLETE!
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {(pickError || playersError) && (
        <div className="alert alert-error">
          <span>{pickError || playersError}</span>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              setPickError(null);
              refreshDraftState();
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Draft Board */}
        <div className="lg:col-span-8 card bg-base-100 shadow">
          <div className="card-body p-4">
            <h2 className="card-title">Draft Board</h2>
            <div className="overflow-x-auto">
              <DraftBoard
                teams={teams}
                picks={transformedDraftPicks}
                currentPick={currentPickNumber || 0}
                userTeamId={draftData?.userTeam?.teamId || ''}
              />
            </div>
          </div>
        </div>

        {/* User's Team */}
        <div className="lg:col-span-4 card bg-base-100 shadow">
          <div className="card-body p-4">
            <h2 className="card-title">
              {draftData?.userTeam?.teamName || 'Your Team'}
              <span className="text-sm font-normal">({userTeam.length} players)</span>
            </h2>
            <div className="overflow-y-auto max-h-64">
              {userTeam.length === 0 ? (
                <div className="text-center py-8 text-base-content/70">
                  <p>Your team roster will appear here as you draft players.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userTeam.map(player => player && (
                    <PlayerRosterCard key={player.playerId} player={player} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Available Players */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="card-title">
              Available Players
              <span className="text-sm font-normal">({playerCount} available)</span>
              {isPlayersLoading && <span className="loading loading-spinner loading-sm"></span>}
            </h2>

            <div className="flex flex-wrap gap-2">
              {/* Position filter */}
              <div className="join">
                {availablePositions.map(position => (
                  <button
                    key={position}
                    className={`join-item btn btn-sm ${positionFilter === position ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPositionFilter(position)}
                  >
                    {position}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Search players..."
                  className="input input-bordered input-sm w-full max-w-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlayers.map(player => (
              <DraftPlayerCard
                key={player.playerId}
                player={player}
                onDraft={handleDraftPlayer}
                disabled={!isUserTurn || isPickingPlayer || isDraftComplete}
                isLoading={isPickingPlayer}
              />
            ))}

            {filteredPlayers.length === 0 && !isPlayersLoading && (
              <div className="md:col-span-2 lg:col-span-3 text-center py-8 text-base-content/70">
                <p>No players match your filters.</p>
              </div>
            )}

            {isPlayersLoading && (
              <div className="md:col-span-2 lg:col-span-3 text-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="mt-2 text-base-content/70">Loading players...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Copilot Draft Suggestions */}
      {isUserTurn && !isDraftComplete && filteredPlayers.length > 0 && (
        <div className="card bg-primary text-primary-content">
          <div className="card-body">
            <h2 className="card-title">AI Copilot Suggestion</h2>
            <p>Based on your team needs and draft position, consider drafting {filteredPlayers[0]?.fullName} ({filteredPlayers[0]?.position}, {filteredPlayers[0]?.nflTeamAbbreviation}).</p>
            <p className="text-sm">This player has high projected points and fits your team&apos;s current needs.</p>
            <div className="card-actions justify-end">
              <button
                className="btn btn-outline"
                onClick={() => handleDraftPlayer(filteredPlayers[0]?.playerId)}
                disabled={isPickingPlayer}
              >
                {isPickingPlayer ? 'Drafting...' : `Draft ${filteredPlayers[0]?.fullName}`}
              </button>
              <button className="btn" disabled>Suggest Another</button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Complete Message */}
      {isDraftComplete && (
        <div className="card bg-success text-success-content">
          <div className="card-body text-center">
            <h2 className="card-title justify-center">🎉 Draft Complete!</h2>
            <p>The draft has been completed. Check your team roster and prepare for the season!</p>
          </div>
        </div>
      )}
    </div>
  );
}