'use client';

import React, { useState, useEffect } from 'react';

// Mock data interfaces
interface TeamStanding {
  teamId: string;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string;
}

// Mock data
const mockStandings: TeamStanding[] = [
  { teamId: 'team2', name: 'Fantasy Kings', owner: 'John', wins: 4, losses: 1, ties: 0, pointsFor: 587.2, pointsAgainst: 513.8, streak: 'W3' },
  { teamId: 'team4', name: 'EndZone Eagles', owner: 'Mike', wins: 4, losses: 1, ties: 0, pointsFor: 552.7, pointsAgainst: 489.4, streak: 'W2' },
  { teamId: 'team1', name: 'Your Team', owner: 'You', wins: 3, losses: 2, ties: 0, pointsFor: 573.6, pointsAgainst: 565.2, streak: 'L1' },
  { teamId: 'team3', name: 'Touchdown Titans', owner: 'Sarah', wins: 2, losses: 3, ties: 0, pointsFor: 536.9, pointsAgainst: 552.1, streak: 'W1' },
  { teamId: 'team5', name: 'Red Zone Raiders', owner: 'Alex', wins: 2, losses: 3, ties: 0, pointsFor: 501.3, pointsAgainst: 518.7, streak: 'L2' },
  { teamId: 'team6', name: 'Gridiron Giants', owner: 'Emma', wins: 0, losses: 5, ties: 0, pointsFor: 478.5, pointsAgainst: 590.9, streak: 'L5' },
];

interface PageProps {
  params: {
    leagueId: string;
  };
}

export default function StandingsPage({ params }: PageProps) {
  const { leagueId } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setStandings(mockStandings);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [leagueId]);
  
  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">League Standings - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <h1 className="page-title">League Standings</h1>
      
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team</th>
                  <th>Record</th>
                  <th className="hidden md:table-cell">PCT</th>
                  <th className="hidden md:table-cell">PF</th>
                  <th className="hidden md:table-cell">PA</th>
                  <th className="hidden md:table-cell">Streak</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, index) => (
                  <tr key={team.teamId} className={team.teamId === 'team1' ? 'bg-primary/10' : ''}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-base-content/70">{team.owner}</div>
                    </td>
                    <td>{team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}</td>
                    <td className="hidden md:table-cell">
                      {team.wins + team.losses + team.ties > 0 
                        ? (team.wins / (team.wins + team.losses + team.ties)).toFixed(3)
                        : '.000'
                      }
                    </td>
                    <td className="hidden md:table-cell">{team.pointsFor.toFixed(1)}</td>
                    <td className="hidden md:table-cell">{team.pointsAgainst.toFixed(1)}</td>
                    <td className="hidden md:table-cell">{team.streak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Playoff Picture */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Playoff Picture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-base-300 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Playoff Teams (Top 4)</h3>
              <ol className="list-decimal list-inside space-y-1">
                {standings.slice(0, 4).map(team => (
                  <li key={team.teamId} className={team.teamId === 'team1' ? 'font-medium text-primary' : ''}>
                    {team.name} ({team.wins}-{team.losses})
                  </li>
                ))}
              </ol>
            </div>
            
            <div className="border border-base-300 rounded-lg p-4">
              <h3 className="font-semibold mb-2">On the Outside</h3>
              <ol className="list-decimal list-inside space-y-1" start={5}>
                {standings.slice(4).map(team => (
                  <li key={team.teamId} className={team.teamId === 'team1' ? 'font-medium text-primary' : ''}>
                    {team.name} ({team.wins}-{team.losses})
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Copilot Analysis */}
      <div className="card bg-primary text-primary-content">
        <div className="card-body">
          <h2 className="card-title">AI Copilot Analysis</h2>
          <p>Your team is currently in playoff position at 3rd place, but there's only a 1-game lead over the 5th place team.</p>
          <p className="text-sm mt-2">Your team has scored the 2nd most points in the league, which is a good sign. Teams that score a lot of points tend to win more games in the long run.</p>
        </div>
      </div>
    </div>
  );
}