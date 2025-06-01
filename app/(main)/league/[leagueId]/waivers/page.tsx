'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DraftPlayerCard from '@/src/components/draft/DraftPlayerCard';
import PlayerRosterCard from '@/src/components/roster/PlayerRosterCard';

// Mock data interfaces
interface NFLPlayer {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: 'Active' | 'Injured_Out' | 'Injured_IR' | 'Bye_Week';
  projectedPoints: number;
}

interface RosterPlayer extends NFLPlayer {
  isStarter: boolean;
}

// Mock data
const mockAvailablePlayers: NFLPlayer[] = [
  { playerId: 'p101', fullName: 'Michael Pittman', position: 'WR', nflTeamAbbreviation: 'IND', status: 'Active', projectedPoints: 14.2 },
  { playerId: 'p102', fullName: 'Kenneth Walker', position: 'RB', nflTeamAbbreviation: 'SEA', status: 'Active', projectedPoints: 13.7 },
  { playerId: 'p103', fullName: 'George Kittle', position: 'TE', nflTeamAbbreviation: 'SF', status: 'Active', projectedPoints: 12.5 },
  { playerId: 'p104', fullName: 'Jared Goff', position: 'QB', nflTeamAbbreviation: 'DET', status: 'Active', projectedPoints: 18.9 },
  { playerId: 'p105', fullName: 'Tee Higgins', position: 'WR', nflTeamAbbreviation: 'CIN', status: 'Injured_Out', projectedPoints: 0 },
  { playerId: 'p106', fullName: 'Rhamondre Stevenson', position: 'RB', nflTeamAbbreviation: 'NE', status: 'Active', projectedPoints: 11.8 },
  { playerId: 'p107', fullName: 'DeVonta Smith', position: 'WR', nflTeamAbbreviation: 'PHI', status: 'Active', projectedPoints: 13.4 },
  { playerId: 'p108', fullName: 'Jordan Love', position: 'QB', nflTeamAbbreviation: 'GB', status: 'Active', projectedPoints: 16.7 },
];

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

export default function WaiversPage({ params }: PageProps) {
  const { leagueId } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState<NFLPlayer[]>([]);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingClaim, setPendingClaim] = useState<{
    addPlayer?: NFLPlayer;
    dropPlayer?: RosterPlayer;
  }>({});
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setAvailablePlayers(mockAvailablePlayers);
      setRoster(mockRoster);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [leagueId]);
  
  // Filter players by position and search query
  const filteredPlayers = availablePlayers.filter(player => {
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    const matchesSearch = player.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPosition && matchesSearch;
  });
  
  // Handle player add/drop
  const handleAddPlayer = (playerId: string) => {
    const player = availablePlayers.find(p => p.playerId === playerId);
    if (player) {
      setPendingClaim({ ...pendingClaim, addPlayer: player });
    }
  };
  
  const handleDropPlayer = (playerId: string) => {
    const player = roster.find(p => p.playerId === playerId);
    if (player) {
      setPendingClaim({ ...pendingClaim, dropPlayer: player });
    }
  };
  
  const handleSubmitClaim = async () => {
    if (!pendingClaim.addPlayer || !pendingClaim.dropPlayer) return;
    
    try {
      // TODO: Call API to /api/leagues/:leagueId/waivers/claim
      // For the PoC, we'll simulate a successful claim after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setRoster(prev => [
        ...prev.filter(p => p.playerId !== pendingClaim.dropPlayer?.playerId),
        { ...pendingClaim.addPlayer, isStarter: false } as RosterPlayer
      ]);
      
      setAvailablePlayers(prev => [
        ...prev.filter(p => p.playerId !== pendingClaim.addPlayer?.playerId),
        pendingClaim.dropPlayer as NFLPlayer
      ]);
      
      // Clear pending claim
      setPendingClaim({});
    } catch (error) {
      console.error('Waiver claim failed:', error);
      // Handle error
    }
  };
  
  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">Waiver Wire - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <h1 className="page-title">Waiver Wire</h1>
      
      {/* Pending Add/Drop Modal */}
      {(pendingClaim.addPlayer || pendingClaim.dropPlayer) && (
        <div className="card bg-base-100 shadow-lg border border-primary">
          <div className="card-body">
            <h2 className="card-title">Pending Waiver Claim</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Adding:</h3>
                {pendingClaim.addPlayer ? (
                  <DraftPlayerCard
                    player={pendingClaim.addPlayer}
                    onDraft={() => {}} // No action needed here
                  />
                ) : (
                  <div className="p-4 border border-dashed border-base-300 rounded-lg text-center">
                    <p className="text-base-content/70">Select a player to add</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Dropping:</h3>
                {pendingClaim.dropPlayer ? (
                  <PlayerRosterCard
                    player={pendingClaim.dropPlayer}
                    onDrop={() => setPendingClaim({ ...pendingClaim, dropPlayer: undefined })}
                  />
                ) : (
                  <div className="p-4 border border-dashed border-base-300 rounded-lg text-center">
                    <p className="text-base-content/70">Select a player to drop</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card-actions justify-end mt-4">
              <button 
                className="btn btn-outline"
                onClick={() => setPendingClaim({})}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                disabled={!pendingClaim.addPlayer || !pendingClaim.dropPlayer}
                onClick={handleSubmitClaim}
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Available Players */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="card-title">Available Players</h2>
            
            <div className="flex flex-wrap gap-2">
              {/* Position filter */}
              <div className="join">
                <button 
                  className={`join-item btn btn-sm ${positionFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPositionFilter('ALL')}
                >
                  ALL
                </button>
                <button 
                  className={`join-item btn btn-sm ${positionFilter === 'QB' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPositionFilter('QB')}
                >
                  QB
                </button>
                <button 
                  className={`join-item btn btn-sm ${positionFilter === 'RB' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPositionFilter('RB')}
                >
                  RB
                </button>
                <button 
                  className={`join-item btn btn-sm ${positionFilter === 'WR' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPositionFilter('WR')}
                >
                  WR
                </button>
                <button 
                  className={`join-item btn btn-sm ${positionFilter === 'TE' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPositionFilter('TE')}
                >
                  TE
                </button>
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
                onDraft={handleAddPlayer}
              />
            ))}
            
            {filteredPlayers.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 text-center py-8 text-base-content/70">
                <p>No players match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* My Roster */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">My Roster</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roster.map(player => (
              <PlayerRosterCard
                key={player.playerId}
                player={player}
                onDrop={handleDropPlayer}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* AI Copilot Suggestion */}
      <div className="card bg-primary text-primary-content">
        <div className="card-body">
          <h2 className="card-title">AI Copilot Suggestion</h2>
          <p>Consider adding Kenneth Walker (RB, SEA) and dropping Ja'Marr Chase (WR, CIN).</p>
          <p className="text-sm">Walker has a favorable schedule coming up, while Chase is on bye this week and you have good WR depth.</p>
          <div className="card-actions justify-end">
            <button 
              className="btn btn-outline"
              onClick={() => {
                const addPlayer = availablePlayers.find(p => p.playerId === 'p102');
                const dropPlayer = roster.find(p => p.playerId === 'p7');
                if (addPlayer && dropPlayer) {
                  setPendingClaim({ addPlayer, dropPlayer });
                }
              }}
            >
              Apply Suggestion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}