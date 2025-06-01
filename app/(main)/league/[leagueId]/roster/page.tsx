'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
];

interface PageProps {
  params: {
    leagueId: string;
  };
}

export default function RosterPage({ params }: PageProps) {
  const { leagueId } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setRoster(mockRoster);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [leagueId]);
  
  // Group players by position
  const starters = roster.filter(player => player.isStarter);
  const bench = roster.filter(player => !player.isStarter);
  
  // Calculate team stats
  const totalProjectedPoints = starters.reduce((sum, player) => sum + player.projectedPoints, 0);
  
  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">My Roster - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="page-title">My Roster</h1>
        
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
      
      {/* Team Summary */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Team Summary</h2>
          <div className="stats stats-vertical lg:stats-horizontal shadow">
            <div className="stat">
              <div className="stat-title">Projected Points</div>
              <div className="stat-value">{totalProjectedPoints.toFixed(1)}</div>
              <div className="stat-desc">Week 5</div>
            </div>
            <div className="stat">
              <div className="stat-title">Record</div>
              <div className="stat-value">3-1</div>
              <div className="stat-desc">Rank: 3rd</div>
            </div>
            <div className="stat">
              <div className="stat-title">Roster Health</div>
              <div className="stat-value text-success">85%</div>
              <div className="stat-desc text-success">1 player on bye</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Starters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Starters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {starters.map(player => (
              <PlayerRosterCard
                key={player.playerId}
                player={player}
                onBench={(playerId) => {
                  // In a real app, this would update the server
                  setRoster(prev => prev.map(p => 
                    p.playerId === playerId ? {...p, isStarter: false} : p
                  ));
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Bench */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Bench</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bench.map(player => (
              <PlayerRosterCard
                key={player.playerId}
                player={player}
                onStart={(playerId) => {
                  // In a real app, this would update the server
                  setRoster(prev => prev.map(p => 
                    p.playerId === playerId ? {...p, isStarter: true} : p
                  ));
                }}
              />
            ))}
            
            {bench.length === 0 && (
              <div className="md:col-span-2 text-center py-8 text-base-content/70">
                <p>Your bench is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}