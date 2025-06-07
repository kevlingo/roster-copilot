'use client';

import React, { useState, useEffect } from 'react';
import { GetStandingsResponseDto, TeamStandingDto } from '@/lib/dtos/standings.dto';

interface PageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

export default async function StandingsPage({ params }: PageProps) {
  const { leagueId } = await params;
  const [isLoading, setIsLoading] = useState(true);
  const [standings, setStandings] = useState<TeamStandingDto[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<GetStandingsResponseDto['leagueInfo'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch standings data from API
  useEffect(() => {
    async function fetchStandings() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/leagues/${leagueId}/standings`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch standings');
        }

        const data: GetStandingsResponseDto = await response.json();
        setStandings(data.standings);
        setLeagueInfo(data.leagueInfo);

      } catch (err) {
        console.error('Error fetching standings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load standings');
      } finally {
        setIsLoading(false);
      }
    }

    if (leagueId) {
      fetchStandings();
    }
  }, [leagueId]);
  
  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">League Standings</h1>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
              <span className="ml-4">Loading standings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">League Standings</h1>
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error loading standings: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">League Standings</h1>
        {leagueInfo && (
          <div className="text-sm text-base-content/70">
            Week {leagueInfo.currentSeasonWeek} • {leagueInfo.leagueName}
          </div>
        )}
      </div>
      
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
                {standings.map((team) => (
                  <tr key={team.teamId} className="">
                    <td>{team.rank}</td>
                    <td>
                      <div className="font-medium">{team.teamName}</div>
                      <div className="text-sm text-base-content/70">Team ID: {team.teamId.slice(-8)}</div>
                    </td>
                    <td>{team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}</td>
                    <td className="hidden md:table-cell">
                      {team.winPercentage.toFixed(3)}
                    </td>
                    <td className="hidden md:table-cell">{team.pointsFor.toFixed(1)}</td>
                    <td className="hidden md:table-cell">{team.pointsAgainst.toFixed(1)}</td>
                    <td className="hidden md:table-cell">
                      {/* TODO: Calculate streak from recent matchups */}
                      --
                    </td>
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
                  <li key={team.teamId}>
                    {team.teamName} ({team.wins}-{team.losses})
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-base-300 rounded-lg p-4">
              <h3 className="font-semibold mb-2">On the Outside</h3>
              <ol className="list-decimal list-inside space-y-1" start={5}>
                {standings.slice(4).map(team => (
                  <li key={team.teamId}>
                    {team.teamName} ({team.wins}-{team.losses})
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Copilot Analysis */}
      {standings.length > 0 && (
        <div className="card bg-primary text-primary-content">
          <div className="card-body">
            <h2 className="card-title">League Analysis</h2>
            <p>
              Current standings show {standings[0].teamName} leading with a {standings[0].wins}-{standings[0].losses} record.
            </p>
            <p className="text-sm mt-2">
              {standings.length} teams competing • Week {leagueInfo?.currentSeasonWeek} of the season
            </p>
          </div>
        </div>
      )}
    </div>
  );
}