/**
 * Fantasy Matchup Component
 * Displays a head-to-head fantasy matchup with team lineups, player scores, and total team scores
 * Following Frontend Architecture guidelines with DaisyUI + Tailwind CSS
 */

import React from 'react';
import { FantasyMatchupDto, FantasyPlayerDto, FantasyTeamDto } from '@/lib/dtos/matchup.dto';

interface FantasyMatchupProps {
  matchup: FantasyMatchupDto | null;
  isLoading?: boolean;
}

interface TeamSectionProps {
  team: FantasyTeamDto;
  isUserTeam: boolean;
}

interface PlayerRowProps {
  player: FantasyPlayerDto;
  isHighlighted?: boolean;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player, isHighlighted = false }) => {
  const getPositionBadgeClass = (position: string) => {
    switch (position) {
      case 'QB':
        return 'badge-primary';
      case 'RB':
        return 'badge-secondary';
      case 'WR':
        return 'badge-accent';
      case 'TE':
        return 'badge-info';
      case 'K':
        return 'badge-warning';
      case 'DEF':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'Injured_Out':
        return <span className="text-error text-xs">OUT</span>;
      case 'Injured_Questionable':
        return <span className="text-warning text-xs">Q</span>;
      case 'Bye Week':
        return <span className="text-neutral text-xs">BYE</span>;
      default:
        return null;
    }
  };

  return (
    <tr className={`hover:bg-base-200 ${isHighlighted ? 'bg-primary/10' : ''}`}>
      <td className="py-2">
        <div className="flex items-center space-x-2">
          <div className={`badge ${getPositionBadgeClass(player.position)} badge-sm`}>
            {player.position}
          </div>
          <div>
            <div className="font-medium text-sm">{player.fullName}</div>
            <div className="text-xs text-base-content/60 flex items-center space-x-1">
              <span>{player.nflTeamAbbreviation}</span>
              {player.opponent && <span>{player.opponent}</span>}
              {getStatusIndicator(player.status)}
            </div>
          </div>
        </div>
      </td>
      <td className="py-2 text-right">
        <span className="font-bold text-lg">{player.projectedPoints.toFixed(1)}</span>
      </td>
    </tr>
  );
};

const TeamSection: React.FC<TeamSectionProps> = ({ team, isUserTeam }) => {
  return (
    <div className={`card bg-base-100 shadow-md border-2 ${
      isUserTeam ? 'border-primary' : 'border-base-300'
    }`}>
      <div className="card-body p-4">
        {/* Team Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-lg font-bold ${isUserTeam ? 'text-primary' : ''}`}>
              {team.teamName}
              {isUserTeam && <span className="ml-2 badge badge-primary badge-sm">YOU</span>}
            </h3>
            <p className="text-sm text-base-content/60">Starting Lineup</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              team.totalFantasyPoints > 0 ? 'text-success' : 'text-base-content'
            }`}>
              {team.totalFantasyPoints.toFixed(1)}
            </div>
            <div className="text-xs text-base-content/60">Total Points</div>
          </div>
        </div>

        {/* Players Table */}
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                <th className="text-left">Player</th>
                <th className="text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {team.starters.map((player) => (
                <PlayerRow 
                  key={player.playerId} 
                  player={player}
                  isHighlighted={isUserTeam}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FantasyMatchup: React.FC<FantasyMatchupProps> = ({ matchup, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-6 w-20"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-96 w-full"></div>
          <div className="skeleton h-96 w-full"></div>
        </div>
      </div>
    );
  }

  if (!matchup) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/60">No matchup data available</p>
      </div>
    );
  }

  const userTeamWinning = matchup.userTeam.totalFantasyPoints > matchup.opponentTeam.totalFantasyPoints;
  const isTied = matchup.userTeam.totalFantasyPoints === matchup.opponentTeam.totalFantasyPoints;

  return (
    <div className="space-y-6">
      {/* Matchup Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Fantasy Matchup</h2>
        <div className="flex items-center justify-center space-x-4">
          <div className="badge badge-neutral">Week {matchup.weekNumber}</div>
          <div className={`badge ${
            matchup.matchupStatus === 'Final' ? 'badge-success' : 
            matchup.matchupStatus === 'InProgress' ? 'badge-warning' : 'badge-neutral'
          }`}>
            {matchup.matchupStatus}
          </div>
        </div>
        
        {/* Score Summary */}
        <div className="mt-4 p-4 bg-base-200 rounded-lg">
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className={`text-3xl font-bold ${userTeamWinning ? 'text-success' : ''}`}>
                {matchup.userTeam.totalFantasyPoints.toFixed(1)}
              </div>
              <div className="text-sm text-base-content/60">{matchup.userTeam.teamName}</div>
            </div>
            <div className="text-2xl font-bold text-base-content/40">VS</div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${!userTeamWinning && !isTied ? 'text-success' : ''}`}>
                {matchup.opponentTeam.totalFantasyPoints.toFixed(1)}
              </div>
              <div className="text-sm text-base-content/60">{matchup.opponentTeam.teamName}</div>
            </div>
          </div>
          
          {/* Win/Loss Indicator */}
          {matchup.matchupStatus === 'Final' && (
            <div className="mt-2">
              {isTied ? (
                <div className="badge badge-neutral">Tied</div>
              ) : (
                <div className={`badge ${userTeamWinning ? 'badge-success' : 'badge-error'}`}>
                  {userTeamWinning ? 'You Win!' : 'You Lose'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Team Lineups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamSection team={matchup.userTeam} isUserTeam={true} />
        <TeamSection team={matchup.opponentTeam} isUserTeam={false} />
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-xs text-base-content/50">
          Fantasy points based on PoC projected data
        </p>
      </div>
    </div>
  );
};

export default FantasyMatchup;
