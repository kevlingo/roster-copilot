'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Types for the roster data from API
interface RosterPlayer {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: string;
  projectedPoints: number;
  lineupStatus: 'starter' | 'bench';
}

interface RosterSlotCount {
  position: string;
  required: number;
  current: number;
  starters: number;
  available: number;
}

interface TeamInfo {
  teamId: string;
  teamName: string;
  leagueId: string;
  leagueName: string;
}

interface RosterData {
  teamInfo: TeamInfo;
  rosterSettings: Record<string, number>;
  rosterSlotCounts: RosterSlotCount[];
  playersByPosition: Record<string, RosterPlayer[]>;
  totalPlayersOnRoster: number;
  currentSeasonWeek: number;
}

interface PageProps {
  params: {
    leagueId: string;
  };
}

export default function RosterPage({ params }: PageProps) {
  const { leagueId } = params;
  const [rosterData, setRosterData] = useState<RosterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [droppingPlayer, setDroppingPlayer] = useState<string | null>(null);

  // Fetch roster data from API
  useEffect(() => {
    const fetchRosterData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/leagues/${leagueId}/my-team/roster`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch roster data');
        }

        const data = await response.json();
        setRosterData(data);
      } catch (err) {
        console.error('Error fetching roster:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (leagueId) {
      fetchRosterData();
    }
  }, [leagueId]);

  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'badge-success';
      case 'injured_out':
      case 'injured_ir':
        return 'badge-error';
      case 'injured_questionable':
        return 'badge-warning';
      case 'bye week':
      case 'bye_week':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  // Handle dropping a player
  const handleDropPlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Are you sure you want to drop ${playerName}?`)) {
      return;
    }

    try {
      setDroppingPlayer(playerId);

      const response = await fetch(`/api/leagues/${leagueId}/my-team/roster/drop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerIdToDrop: playerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to drop player');
      }

      const result = await response.json();

      // Refresh roster data after successful drop
      const rosterResponse = await fetch(`/api/leagues/${leagueId}/my-team/roster`);
      if (rosterResponse.ok) {
        const updatedRosterData = await rosterResponse.json();
        setRosterData(updatedRosterData);
      }

      console.log('Player dropped successfully:', result.message);

    } catch (error) {
      console.error('Failed to drop player:', error);
      alert(`Failed to drop player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDroppingPlayer(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">My Roster - Loading...</h1>
        <div className="flex justify-center items-center min-h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container space-y-6">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // No data state
  if (!rosterData) {
    return (
      <div className="page-container space-y-6">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>No roster data available</span>
        </div>
      </div>
    );
  }

  const { teamInfo, rosterSlotCounts, playersByPosition, totalPlayersOnRoster, currentSeasonWeek } = rosterData;

  // Get all players for calculations
  const allPlayers = Object.values(playersByPosition).flat();
  const starters = allPlayers.filter(player => player.lineupStatus === 'starter');
  const bench = allPlayers.filter(player => player.lineupStatus === 'bench');
  const totalProjectedPoints = starters.reduce((sum, player) => sum + player.projectedPoints, 0);

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="page-title">{teamInfo.teamName}</h1>
          <p className="text-lg text-base-content/70">
            {teamInfo.leagueName} • Week {currentSeasonWeek} • {totalPlayersOnRoster} Players
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/league/${leagueId}/lineup`}
            className="btn btn-primary btn-sm"
          >
            Edit Lineup
          </Link>
          <Link
            href={`/league/${leagueId}/waivers`}
            className="btn btn-outline btn-sm"
          >
            Add/Drop Players
          </Link>
        </div>
      </div>

      {/* Roster Slot Summary */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title mb-4">Roster Composition</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {rosterSlotCounts.map((slot) => (
              <div key={slot.position} className="text-center">
                <div className="font-semibold text-lg">{slot.position}</div>
                <div className="text-sm text-base-content/70">
                  {slot.current}/{slot.required}
                </div>
                <div className="text-xs text-base-content/50">
                  {slot.starters} starters
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Summary */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Team Summary</h2>
          <div className="stats stats-vertical lg:stats-horizontal shadow">
            <div className="stat">
              <div className="stat-title">Projected Points</div>
              <div className="stat-value">{totalProjectedPoints.toFixed(1)}</div>
              <div className="stat-desc">Week {currentSeasonWeek}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Players</div>
              <div className="stat-value">{totalPlayersOnRoster}</div>
              <div className="stat-desc">{starters.length} starters, {bench.length} bench</div>
            </div>
            <div className="stat">
              <div className="stat-title">Roster Health</div>
              <div className="stat-value text-success">
                {totalPlayersOnRoster > 0 ? Math.round((allPlayers.filter(p => p.status.toLowerCase() === 'active').length / totalPlayersOnRoster) * 100) : 0}%
              </div>
              <div className="stat-desc">
                {allPlayers.filter(p => p.status.toLowerCase().includes('bye')).length} on bye
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players by Position */}
      {Object.keys(playersByPosition).length > 0 ? (
        <div className="space-y-6">
          {['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map((position) => {
            const players = playersByPosition[position] || [];
            if (players.length === 0) return null;

            return (
              <div key={position} className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title text-xl mb-4">
                    {position} ({players.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Team</th>
                          <th>Status</th>
                          <th>Projected Points</th>
                          <th>Lineup Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((player) => (
                          <tr key={player.playerId}>
                            <td>
                              <div className="font-semibold">{player.fullName}</div>
                              <div className="text-sm text-base-content/70">{player.position}</div>
                            </td>
                            <td>
                              <span className="badge badge-outline">{player.nflTeamAbbreviation}</span>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeColor(player.status)}`}>
                                {player.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              <span className="font-mono">{player.projectedPoints.toFixed(1)}</span>
                            </td>
                            <td>
                              <span className={`badge ${player.lineupStatus === 'starter' ? 'badge-primary' : 'badge-ghost'}`}>
                                {player.lineupStatus === 'starter' ? 'Starter' : 'Bench'}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-error btn-xs"
                                onClick={() => handleDropPlayer(player.playerId, player.fullName)}
                                disabled={droppingPlayer === player.playerId}
                              >
                                {droppingPlayer === player.playerId ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  'Drop'
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty roster message */
        <div className="card bg-base-100 shadow">
          <div className="card-body text-center">
            <h3 className="card-title justify-center mb-4">No Players on Roster</h3>
            <p className="text-base-content/70 mb-4">
              Your roster is empty. Add players through the draft or waiver wire.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}