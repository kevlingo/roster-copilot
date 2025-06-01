'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlayerRosterCard from '@/src/components/roster/PlayerRosterCard';

// Mock data interfaces
interface RosterPlayer {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: 'Active' | 'Injured_Out' | 'Injured_IR' | 'Bye_Week';
  projectedPoints: number;
  isStarter: boolean;
}

// Position slots based on league settings
interface LineupSlots {
  [key: string]: number;
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  FLEX: number;
  K: number;
  DST: number;
}

// Mock data
const mockRoster: RosterPlayer[] = [
  { playerId: 'p1', fullName: 'Patrick Mahomes', position: 'QB', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 24.7, isStarter: true },
  { playerId: 'p2', fullName: 'Christian McCaffrey', position: 'RB', nflTeamAbbreviation: 'SF', status: 'Active', projectedPoints: 22.3, isStarter: true },
  { playerId: 'p3', fullName: 'Justin Jefferson', position: 'WR', nflTeamAbbreviation: 'MIN', status: 'Active', projectedPoints: 19.8, isStarter: true },
  { playerId: 'p4', fullName: 'Travis Kelce', position: 'TE', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 15.2, isStarter: true },
  { playerId: 'p5', fullName: 'Saquon Barkley', position: 'RB', nflTeamAbbreviation: 'PHI', status: 'Active', projectedPoints: 18.5, isStarter: true },
  { playerId: 'p6', fullName: 'Tyreek Hill', position: 'WR', nflTeamAbbreviation: 'MIA', status: 'Active', projectedPoints: 18.9, isStarter: true },
  { playerId: 'p7', fullName: 'Ja\'Marr Chase', position: 'WR', nflTeamAbbreviation: 'CIN', status: 'Bye_Week', projectedPoints: 17.6, isStarter: false },
  { playerId: 'p8', fullName: 'Josh Allen', position: 'QB', nflTeamAbbreviation: 'BUF', status: 'Active', projectedPoints: 23.1, isStarter: false },
  { playerId: 'p9', fullName: 'Raheem Mostert', position: 'RB', nflTeamAbbreviation: 'MIA', status: 'Active', projectedPoints: 14.2, isStarter: false },
  { playerId: 'p10', fullName: 'Dallas Cowboys', position: 'DST', nflTeamAbbreviation: 'DAL', status: 'Active', projectedPoints: 8.7, isStarter: true },
  { playerId: 'p11', fullName: 'Justin Tucker', position: 'K', nflTeamAbbreviation: 'BAL', status: 'Active', projectedPoints: 9.3, isStarter: true },
];

// League settings
const lineupSlots: LineupSlots = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 1, // RB/WR/TE
  K: 1,
  DST: 1,
};

interface PageProps {
  params: {
    leagueId: string;
  };
}

export default function LineupPage({ params }: PageProps) {
  const { leagueId } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setRoster(mockRoster);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [leagueId]);
  
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
    setSaveLoading(true);
    
    try {
      // TODO: Call API to /api/leagues/:leagueId/lineup
      // For the PoC, we'll simulate a successful save after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to roster page
      router.push(`/league/${leagueId}/roster`);
    } catch (error) {
      console.error('Save lineup failed:', error);
      // Handle error
    } finally {
      setSaveLoading(false);
    }
  };
  
  // Calculate roster issues
  const getStarterCount = (position: string) => {
    return roster.filter(p => p.isStarter && p.position === position).length;
  };
  
  const rosterIssues = () => {
    const issues = [];
    
    if (getStarterCount('QB') !== lineupSlots.QB) {
      issues.push(`You must start ${lineupSlots.QB} QB`);
    }
    if (getStarterCount('RB') !== lineupSlots.RB) {
      issues.push(`You must start ${lineupSlots.RB} RBs`);
    }
    if (getStarterCount('WR') !== lineupSlots.WR) {
      issues.push(`You must start ${lineupSlots.WR} WRs`);
    }
    if (getStarterCount('TE') !== lineupSlots.TE) {
      issues.push(`You must start ${lineupSlots.TE} TE`);
    }
    if (getStarterCount('K') !== lineupSlots.K) {
      issues.push(`You must start ${lineupSlots.K} K`);
    }
    if (getStarterCount('DST') !== lineupSlots.DST) {
      issues.push(`You must start ${lineupSlots.DST} DST`);
    }
    
    // TODO: FLEX position calculation
    
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

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="page-title">Edit Lineup</h1>
        
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
      {Object.entries(lineupSlots).map(([position, count]) => (
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
    </div>
  );
}