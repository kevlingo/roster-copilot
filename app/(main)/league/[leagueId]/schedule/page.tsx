'use client';

import React, { useState, useEffect } from 'react';
import { GetScheduleResponseDto, ScheduleMatchupDto } from '@/lib/dtos/schedule.dto';

interface PageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

export default async function SchedulePage({ params }: PageProps) {
  const { leagueId } = await params;
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<GetScheduleResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Fetch schedule data from API
  useEffect(() => {
    async function fetchSchedule() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/leagues/${leagueId}/schedule`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch schedule');
        }
        
        const data: GetScheduleResponseDto = await response.json();
        setScheduleData(data);
        
        // Set selected week to current week
        setSelectedWeek(data.leagueInfo.currentSeasonWeek);
        
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (leagueId) {
      fetchSchedule();
    }
  }, [leagueId]);

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">League Schedule</h1>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
              <span className="ml-4">Loading schedule...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">League Schedule</h1>
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error loading schedule: {error}</span>
        </div>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">League Schedule</h1>
        <div className="alert alert-warning">
          <span>No schedule data available</span>
        </div>
      </div>
    );
  }

  const selectedWeekData = scheduleData.weeks.find(week => week.weekNumber === selectedWeek);

  return (
    <div className="page-container space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">League Schedule</h1>
        <div className="text-sm text-base-content/70">
          Week {scheduleData.leagueInfo.currentSeasonWeek} • {scheduleData.leagueInfo.leagueName}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Select Week</h2>
          <div className="flex flex-wrap gap-2">
            {scheduleData.weeks.map((week) => (
              <button
                key={week.weekNumber}
                className={`btn btn-sm ${
                  selectedWeek === week.weekNumber 
                    ? 'btn-primary' 
                    : week.isCompleted 
                      ? 'btn-outline' 
                      : 'btn-ghost'
                }`}
                onClick={() => setSelectedWeek(week.weekNumber)}
              >
                Week {week.weekNumber}
                {week.isCompleted && <span className="ml-1 text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Week Matchups */}
      {selectedWeekData && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">
                Week {selectedWeek} Matchups
              </h2>
              <div className="badge badge-outline">
                {selectedWeekData.isCompleted ? 'Completed' : 'Upcoming'}
              </div>
            </div>

            <div className="space-y-4">
              {selectedWeekData.matchups.map((matchup) => (
                <MatchupCard
                  key={`${matchup.team1.teamId}-${matchup.team2.teamId}`}
                  matchup={matchup}
                  userTeamId={scheduleData.userTeamId}
                />
              ))}
              
              {selectedWeekData.matchups.length === 0 && (
                <div className="text-center py-8 text-base-content/70">
                  No matchups scheduled for this week
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Summary */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Schedule Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat">
              <div className="stat-title">Total Weeks</div>
              <div className="stat-value text-2xl">{scheduleData.totalWeeks}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Completed Weeks</div>
              <div className="stat-value text-2xl">
                {scheduleData.weeks.filter(w => w.isCompleted).length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Current Week</div>
              <div className="stat-value text-2xl">{scheduleData.leagueInfo.currentSeasonWeek}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Matchup Card Component
interface MatchupCardProps {
  matchup: ScheduleMatchupDto;
  userTeamId?: string;
}

function MatchupCard({ matchup, userTeamId }: MatchupCardProps) {
  const isUserInvolved = matchup.isUserTeamInvolved;
  
  return (
    <div className={`card border ${isUserInvolved ? 'border-primary bg-primary/5' : 'border-base-300'}`}>
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className={`font-medium ${matchup.team1.teamId === userTeamId ? 'text-primary font-bold' : ''}`}>
                  {matchup.team1.teamName}
                </div>
                {matchup.isCompleted && matchup.team1Score !== undefined && (
                  <div className={`text-2xl font-bold ${
                    matchup.winner === 'team1' ? 'text-success' : 
                    matchup.winner === 'tie' ? 'text-warning' : 'text-base-content'
                  }`}>
                    {matchup.team1Score.toFixed(1)}
                  </div>
                )}
              </div>
              
              <div className="mx-4 text-center">
                <div className="text-sm text-base-content/70">vs</div>
                {matchup.winner === 'tie' && (
                  <div className="badge badge-warning badge-sm">TIE</div>
                )}
              </div>
              
              <div className="text-center flex-1">
                <div className={`font-medium ${matchup.team2.teamId === userTeamId ? 'text-primary font-bold' : ''}`}>
                  {matchup.team2.teamName}
                </div>
                {matchup.isCompleted && matchup.team2Score !== undefined && (
                  <div className={`text-2xl font-bold ${
                    matchup.winner === 'team2' ? 'text-success' : 
                    matchup.winner === 'tie' ? 'text-warning' : 'text-base-content'
                  }`}>
                    {matchup.team2Score.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {isUserInvolved && (
            <div className="ml-4">
              <div className="badge badge-primary badge-sm">Your Team</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
