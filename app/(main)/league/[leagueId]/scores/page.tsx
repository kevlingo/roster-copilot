'use client';

/**
 * League Scores Page
 * Displays NFL scoreboard and fantasy matchup for a specific league and week
 * Implements Story 1.12: Display of Fantasy Scores
 */

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import NFLScoreboard from '@/components/scores/NFLScoreboard';
import FantasyMatchup from '@/components/scores/FantasyMatchup';
import { useMatchupData } from '@/lib/hooks/useMatchupData';

export default function LeagueScoresPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  
  // For PoC, default to week 1, but allow user to change
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  const { data, isLoading, error, refetch } = useMatchupData({
    leagueId,
    weekNumber: selectedWeek,
    enabled: !!leagueId
  });

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
  };

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Error loading scores</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button className="btn btn-sm" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Scores</h1>
          {data && (
            <p className="text-base-content/60">
              {data.leagueInfo.leagueName} • Week {selectedWeek}
            </p>
          )}
        </div>
        
        {/* Week Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Week:</span>
          <select 
            className="select select-bordered select-sm w-20"
            value={selectedWeek}
            onChange={(e) => handleWeekChange(parseInt(e.target.value))}
          >
            {[...Array(18)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <button 
            className="btn btn-sm btn-outline"
            onClick={refetch}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Fantasy Matchup Section */}
      <section>
        {isLoading ? (
          <FantasyMatchup matchup={null} isLoading={true} />
        ) : data?.fantasyMatchup ? (
          <FantasyMatchup matchup={data.fantasyMatchup} />
        ) : (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No fantasy matchup available for this week. Make sure you have set your lineup!</span>
          </div>
        )}
      </section>

      {/* NFL Scoreboard Section */}
      <section>
        {isLoading ? (
          <NFLScoreboard games={[]} weekNumber={selectedWeek} isLoading={true} />
        ) : data?.nflScoreboard ? (
          <NFLScoreboard games={data.nflScoreboard} weekNumber={selectedWeek} />
        ) : (
          <NFLScoreboard games={[]} weekNumber={selectedWeek} />
        )}
      </section>

      {/* PoC Notice */}
      {data?.isPoC && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 className="font-bold">Proof of Concept Data</h3>
            <div className="text-xs">
              This page displays static PoC data for demonstration purposes. 
              Fantasy scores are based on projected points from the static dataset.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
