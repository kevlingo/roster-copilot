import React, { useState } from 'react';
import PlayerProfileModal from '@/src/components/player/PlayerProfileModal';

interface RosterPlayer {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: 'Active' | 'Injured_Out' | 'Injured_IR' | 'Bye_Week';
  projectedPoints: number;
  isStarter?: boolean;
}

interface PlayerRosterCardProps {
  player: RosterPlayer;
  onBench?: (playerId: string) => void;
  onStart?: (playerId: string) => void;
  onDrop?: (playerId: string) => void;
}

const PlayerRosterCard: React.FC<PlayerRosterCardProps> = ({
  player,
  onBench,
  onStart,
  onDrop,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Render status with appropriate color/badge
  const renderStatus = () => {
    switch (player.status) {
      case 'Active':
        return <span className="badge badge-sm badge-success">Active</span>;
      case 'Injured_Out':
        return <span className="badge badge-sm badge-error">OUT</span>;
      case 'Injured_IR':
        return <span className="badge badge-sm badge-error">IR</span>;
      case 'Bye_Week':
        return <span className="badge badge-sm badge-warning">BYE</span>;
      default:
        return null;
    }
  };

  const handlePlayerNameClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`card card-side bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-all ${
        player.isStarter ? 'border-l-4 border-l-primary' : ''
      }`}>
        <div className="card-body p-3">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={handlePlayerNameClick}
                className="font-bold text-base text-left hover:text-primary transition-colors cursor-pointer"
                title="View player details"
              >
                {player.fullName}
              </button>
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <span>{player.position}</span>
                <span>•</span>
                <span>{player.nflTeamAbbreviation}</span>
                {renderStatus()}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-lg font-semibold">
                {player.projectedPoints.toFixed(1)}
              </div>
              <div className="text-xs text-base-content/70">Projected</div>
            </div>
          </div>

          <div className="card-actions justify-end mt-2 flex-wrap">
            {player.isStarter && onBench && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onBench(player.playerId)}
              >
                Bench
              </button>
            )}

            {!player.isStarter && onStart && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onStart(player.playerId)}
              >
                Start
              </button>
            )}

            {onDrop && (
              <button
                className="btn btn-error btn-outline btn-sm"
                onClick={() => onDrop(player.playerId)}
              >
                Drop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Player Profile Modal */}
      <PlayerProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playerId={player.playerId}
      />
    </>
  );
};

export default PlayerRosterCard;