'use client';

import React, { useState, useEffect } from 'react';
import DraftPlayerCard from '@/src/components/draft/DraftPlayerCard';
import DraftBoard from '@/src/components/draft/DraftBoard';
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

// Mock data
const mockAvailablePlayers: NFLPlayer[] = [
  { playerId: 'p1', fullName: 'Patrick Mahomes', position: 'QB', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 24.7 },
  { playerId: 'p2', fullName: 'Christian McCaffrey', position: 'RB', nflTeamAbbreviation: 'SF', status: 'Active', projectedPoints: 22.3 },
  { playerId: 'p3', fullName: 'Justin Jefferson', position: 'WR', nflTeamAbbreviation: 'MIN', status: 'Active', projectedPoints: 19.8 },
  { playerId: 'p4', fullName: 'Travis Kelce', position: 'TE', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 15.2 },
  { playerId: 'p5', fullName: 'Saquon Barkley', position: 'RB', nflTeamAbbreviation: 'PHI', status: 'Active', projectedPoints: 18.5 },
  { playerId: 'p6', fullName: 'Tyreek Hill', position: 'WR', nflTeamAbbreviation: 'MIA', status: 'Active', projectedPoints: 18.9 },
  { playerId: 'p7', fullName: 'Ja\'Marr Chase', position: 'WR', nflTeamAbbreviation: 'CIN', status: 'Bye_Week', projectedPoints: 17.6 },
  { playerId: 'p8', fullName: 'Josh Allen', position: 'QB', nflTeamAbbreviation: 'BUF', status: 'Active', projectedPoints: 23.1 },
];

const mockTeams: Team[] = [
  { teamId: 'team1', name: 'Your Team', owner: 'You' },
  { teamId: 'team2', name: 'Fantasy Kings', owner: 'John' },
  { teamId: 'team3', name: 'Touchdown Titans', owner: 'Sarah' },
  { teamId: 'team4', name: 'EndZone Eagles', owner: 'Mike' },
];

const mockDraftPicks: DraftPick[] = [
  // Round 1
  { pickNumber: 1, round: 1, teamId: 'team1' },
  { pickNumber: 2, round: 1, teamId: 'team2' },
  { pickNumber: 3, round: 1, teamId: 'team3' },
  { pickNumber: 4, round: 1, teamId: 'team4' },
  // Round 2 (reverse order for snake draft)
  { pickNumber: 5, round: 2, teamId: 'team4' },
  { pickNumber: 6, round: 2, teamId: 'team3' },
  { pickNumber: 7, round: 2, teamId: 'team2' },
  { pickNumber: 8, round: 2, teamId: 'team1' },
  // Round 3
  { pickNumber: 9, round: 3, teamId: 'team1' },
  { pickNumber: 10, round: 3, teamId: 'team2' },
  { pickNumber: 11, round: 3, teamId: 'team3' },
  { pickNumber: 12, round: 3, teamId: 'team4' },
];

interface PageProps {
  params: {
    leagueId: string;
  };
}

export default function DraftPage({ params }: PageProps) {
  const { leagueId } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState<NFLPlayer[]>([]);
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<NFLPlayer[]>([]);
  const [currentPick, setCurrentPick] = useState(1);
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setAvailablePlayers(mockAvailablePlayers);
      setDraftPicks(mockDraftPicks);
      setTeams(mockTeams);
      setUserTeam([]);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [leagueId]);
  
  // Draft a player
  const handleDraftPlayer = (playerId: string) => {
    // Find the player
    const player = availablePlayers.find(p => p.playerId === playerId);
    if (!player) return;
    
    // Update available players
    setAvailablePlayers(prev => prev.filter(p => p.playerId !== playerId));
    
    // Update draft picks
    setDraftPicks(prev => {
      const updatedPicks = [...prev];
      const currentPickIndex = updatedPicks.findIndex(p => p.pickNumber === currentPick);
      
      if (currentPickIndex !== -1) {
        updatedPicks[currentPickIndex] = {
          ...updatedPicks[currentPickIndex],
          playerId: player.playerId,
          playerName: player.fullName,
          position: player.position,
        };
      }
      
      return updatedPicks;
    });
    
    // If it's the user's turn, add to user team
    const currentDraftPick = draftPicks.find(p => p.pickNumber === currentPick);
    if (currentDraftPick?.teamId === 'team1') {
      setUserTeam(prev => [...prev, player]);
    }
    
    // Advance to next pick
    setCurrentPick(prev => prev + 1);
  };
  
  // Filter players by position and search query
  const filteredPlayers = availablePlayers.filter(player => {
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    const matchesSearch = player.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPosition && matchesSearch;
  });
  
  // Check if it's user's turn
  const isUserTurn = draftPicks.find(p => p.pickNumber === currentPick)?.teamId === 'team1';
  
  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">Draft Room - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Draft Room: {leagueId}</h1>
        <div className="badge badge-primary p-3">
          Pick {currentPick}
          {isUserTurn && <span className="ml-2 font-bold">YOUR TURN!</span>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Draft Board */}
        <div className="lg:col-span-8 card bg-base-100 shadow">
          <div className="card-body p-4">
            <h2 className="card-title">Draft Board</h2>
            <div className="overflow-x-auto">
              <DraftBoard 
                teams={teams}
                picks={draftPicks}
                currentPick={currentPick}
                userTeamId="team1"
              />
            </div>
          </div>
        </div>
        
        {/* User's Team */}
        <div className="lg:col-span-4 card bg-base-100 shadow">
          <div className="card-body p-4">
            <h2 className="card-title">Your Team</h2>
            <div className="overflow-y-auto max-h-64">
              {userTeam.length === 0 ? (
                <div className="text-center py-8 text-base-content/70">
                  <p>Your team roster will appear here as you draft players.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userTeam.map(player => (
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
                onDraft={handleDraftPlayer}
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
      
      {/* AI Copilot Draft Suggestions */}
      {isUserTurn && (
        <div className="card bg-primary text-primary-content">
          <div className="card-body">
            <h2 className="card-title">AI Copilot Suggestion</h2>
            <p>Based on your team needs and draft position, consider drafting Justin Jefferson (WR, MIN).</p>
            <p className="text-sm">Jefferson has a high ceiling and floor as the primary target in Minnesota&apos;s offense.</p>
            <div className="card-actions justify-end">
              <button 
                className="btn btn-outline"
                onClick={() => handleDraftPlayer('p3')}
              >
                Draft Jefferson
              </button>
              <button className="btn">Suggest Another</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}