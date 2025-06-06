/**
 * NFL Scoreboard Component
 * Displays a list of NFL games for a week, showing home team, away team, scores, and game status
 * Following Frontend Architecture guidelines with DaisyUI + Tailwind CSS
 */

import React from 'react';
import { NFLGameDto } from '@/lib/dtos/matchup.dto';

interface NFLScoreboardProps {
  games: NFLGameDto[];
  weekNumber: number;
  isLoading?: boolean;
}

interface GameCardProps {
  game: NFLGameDto;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Final':
        return 'badge-success';
      case 'InProgress':
        return 'badge-warning';
      case 'Scheduled':
        return 'badge-neutral';
      default:
        return 'badge-ghost';
    }
  };

  const formatGameTime = (gameDateTime?: string) => {
    if (!gameDateTime) return '';
    
    try {
      const date = new Date(gameDateTime);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  const isGameFinal = game.gameStatus === 'Final';
  const hasScores = game.homeScore !== undefined && game.awayScore !== undefined;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* Game Status Badge */}
        <div className="flex justify-between items-start mb-3">
          <div className={`badge ${getStatusBadgeClass(game.gameStatus)} badge-sm`}>
            {game.gameStatus || 'Scheduled'}
          </div>
          {!isGameFinal && (
            <div className="text-xs text-base-content/60">
              {formatGameTime(game.gameDateTime_ISO)}
            </div>
          )}
        </div>

        {/* Teams and Scores */}
        <div className="space-y-2">
          {/* Away Team */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-base-content/60">@</span>
              <span className="font-medium text-sm">{game.awayTeamAbbreviation}</span>
            </div>
            {hasScores && (
              <span className={`font-bold text-lg ${
                isGameFinal && game.awayScore! > game.homeScore! 
                  ? 'text-success' 
                  : 'text-base-content'
              }`}>
                {game.awayScore}
              </span>
            )}
          </div>

          {/* Home Team */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-base-content/60">vs</span>
              <span className="font-medium text-sm">{game.homeTeamAbbreviation}</span>
            </div>
            {hasScores && (
              <span className={`font-bold text-lg ${
                isGameFinal && game.homeScore! > game.awayScore! 
                  ? 'text-success' 
                  : 'text-base-content'
              }`}>
                {game.homeScore}
              </span>
            )}
          </div>
        </div>

        {/* PoC Data Indicator */}
        <div className="mt-2 pt-2 border-t border-base-300">
          <span className="text-xs text-base-content/50">PoC Data</span>
        </div>
      </div>
    </div>
  );
};

const NFLScoreboard: React.FC<NFLScoreboardProps> = ({ 
  games, 
  weekNumber, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">NFL Scoreboard</h2>
          <div className="skeleton h-6 w-16"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="skeleton h-32 w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">NFL Scoreboard</h2>
          <div className="badge badge-neutral">Week {weekNumber}</div>
        </div>
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No games scheduled for Week {weekNumber}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">NFL Scoreboard</h2>
        <div className="badge badge-neutral">Week {weekNumber}</div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <GameCard key={game.gameId} game={game} />
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-xs text-base-content/50">
          Displaying PoC static data for demonstration purposes
        </p>
      </div>
    </div>
  );
};

export default NFLScoreboard;
