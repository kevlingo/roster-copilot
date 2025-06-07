'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlayerRosterCard from '@/src/components/roster/PlayerRosterCard';

// Data interfaces
interface RosterPlayer {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: 'Active' | 'Injured_Out' | 'Injured_IR' | 'Bye_Week';
  projectedPoints: number;
  isStarter: boolean;
}

interface LineupData {
  teamInfo: {
    teamId: string;
    teamName: string;
    leagueId: string;
    leagueName: string;
  };
  weekNumber: number;
  lineup: {
    starters: LineupPlayerDto[];
    bench: LineupPlayerDto[];
  };
  rosterSettings: {
    QB: number;
    RB: number;
    WR: number;
    TE: number;
    K: number;
    DEF: number;
    BENCH: number;
  };
  hasExistingLineup: boolean;
}

interface LineupPlayerDto {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: string;
  projectedPoints: number;
  opponent?: string;
  gameTime?: string;
}



interface PageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

export default async function LineupPage({ params }: PageProps) {
  const { leagueId } = await params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [lineupData, setLineupData] = useState<LineupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weekNumber] = useState(1);

  // Load lineup data
  useEffect(() => {
    const loadLineupData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/leagues/${leagueId}/my-team/lineup?week=${weekNumber}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load lineup');
        }

        const data: LineupData = await response.json();
        setLineupData(data);

        // Convert API data to component format
        const allPlayers: RosterPlayer[] = [
          ...data.lineup.starters.map(p => ({ ...p, isStarter: true })),
          ...data.lineup.bench.map(p => ({ ...p, isStarter: false }))
        ].map(p => ({
          ...p,
          status: p.status as 'Active' | 'Injured_Out' | 'Injured_IR' | 'Bye_Week'
        }));

        setRoster(allPlayers);

      } catch (error) {
        console.error('Failed to load lineup:', error);
        setError(error instanceof Error ? error.message : 'Failed to load lineup');
      } finally {
        setIsLoading(false);
      }
    };

    loadLineupData();
  }, [leagueId, weekNumber]);
  
  // Group players by position
  const playersByPosition = roster.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = [];
    }
    acc[player.position].push(player);
    return acc;
  }, {} as Record<string, RosterPlayer[]>);
  
  // Toggle player starter status
  const togglePlayerStatus = (playerId: string) => {
    setRoster(prev => prev.map(player => 
      player.playerId === playerId 
        ? { ...player, isStarter: !player.isStarter } 
        : player
    ));
  };
  
  // Save lineup
  const saveLineup = async () => {
    if (!lineupData) return;

    setSaveLoading(true);
    setError(null);

    try {
      const starterPlayerIds = roster.filter(p => p.isStarter).map(p => p.playerId);
      const benchPlayerIds = roster.filter(p => !p.isStarter).map(p => p.playerId);

      const response = await fetch(`/api/leagues/${leagueId}/my-team/lineup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber,
          starterPlayerIds,
          benchPlayerIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save lineup');
      }

      // Success - redirect back to roster page
      router.push(`/league/${leagueId}/roster`);
    } catch (error) {
      console.error('Save lineup failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to save lineup');
    } finally {
      setSaveLoading(false);
    }
  };
  
  // Calculate roster issues
  const getStarterCount = (position: string) => {
    return roster.filter(p => p.isStarter && p.position === position).length;
  };

  const rosterIssues = () => {
    if (!lineupData) return [];

    const issues = [];
    const settings = lineupData.rosterSettings;

    if (getStarterCount('QB') !== settings.QB) {
      issues.push(`You must start ${settings.QB} QB`);
    }
    if (getStarterCount('RB') !== settings.RB) {
      issues.push(`You must start ${settings.RB} RBs`);
    }
    if (getStarterCount('WR') !== settings.WR) {
      issues.push(`You must start ${settings.WR} WRs`);
    }
    if (getStarterCount('TE') !== settings.TE) {
      issues.push(`You must start ${settings.TE} TE`);
    }
    if (getStarterCount('K') !== settings.K) {
      issues.push(`You must start ${settings.K} K`);
    }
    if (getStarterCount('DEF') !== settings.DEF) {
      issues.push(`You must start ${settings.DEF} DEF`);
    }

    // Check for injured/bye week players in starting lineup
    const injuredStarters = roster.filter(p => p.isStarter && (p.status === 'Injured_Out' || p.status === 'Bye_Week'));
    for (const player of injuredStarters) {
      if (player.status === 'Injured_Out') {
        issues.push(`${player.fullName} is injured and cannot be in starting lineup`);
      } else if (player.status === 'Bye_Week') {
        issues.push(`${player.fullName} is on bye week and cannot be in starting lineup`);
      }
    }

    return issues;
  };

  const issues = rosterIssues();
  const hasIssues = issues.length > 0;
  
  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">Edit Lineup - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">Edit Lineup</h1>
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!lineupData) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">Edit Lineup</h1>
        <div className="alert alert-warning">
          <span>No lineup data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="page-title">Edit Lineup</h1>
          <p className="text-sm text-base-content/70">
            {lineupData.teamInfo.teamName} - Week {weekNumber}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => router.push(`/league/${leagueId}/roster`)}
          >
            Cancel
          </button>
          <button
            className={`btn btn-primary btn-sm ${saveLoading ? 'loading' : ''}`}
            disabled={hasIssues || saveLoading}
            onClick={saveLineup}
          >
            {saveLoading ? 'Saving...' : 'Save Lineup'}
          </button>
        </div>
      </div>
      
      {/* Roster Issues */}
      {hasIssues && (
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <h3 className="font-bold">Invalid Lineup</h3>
            <ul className="list-disc list-inside">
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* AI Copilot Suggestion */}
      <div className="card bg-primary text-primary-content">
        <div className="card-body">
          <h2 className="card-title">AI Copilot Suggestion</h2>
          <p>Start Josh Allen (QB, BUF) over Patrick Mahomes (QB, KC) this week.</p>
          <p className="text-sm">Allen has a favorable matchup against the Jets secondary and is projected for more rushing yards.</p>
          <div className="card-actions justify-end">
            <button 
              className="btn btn-outline"
              onClick={() => {
                // Toggle both QBs
                setRoster(prev => prev.map(p => 
                  p.playerId === 'p1' || p.playerId === 'p8'
                    ? { ...p, isStarter: p.playerId === 'p8' }
                    : p
                ));
              }}
            >
              Apply Suggestion
            </button>
          </div>
        </div>
      </div>
      
      {/* Position Sections */}
      {Object.entries(lineupData.rosterSettings).filter(([pos]) => pos !== 'BENCH').map(([position, count]) => (
        <div key={position} className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title">{position} ({getStarterCount(position)}/{count})</h2>
              {getStarterCount(position) !== count && (
                <span className="text-error">Incorrect number of starters</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {playersByPosition[position]?.map(player => (
                <PlayerRosterCard
                  key={player.playerId}
                  player={player}
                  onBench={player.isStarter ? () => togglePlayerStatus(player.playerId) : undefined}
                  onStart={!player.isStarter ? () => togglePlayerStatus(player.playerId) : undefined}
                />
              )) || (
                <div className="md:col-span-2 text-center py-8 text-base-content/70">
                  <p>No {position} players on your roster.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Bench Section */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Bench</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roster.filter(p => !p.isStarter).map(player => (
              <PlayerRosterCard
                key={player.playerId}
                player={player}
                onStart={() => togglePlayerStatus(player.playerId)}
              />
            ))}
            {roster.filter(p => !p.isStarter).length === 0 && (
              <div className="md:col-span-2 text-center py-8 text-base-content/70">
                <p>All players are in starting lineup.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}