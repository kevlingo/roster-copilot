import React from 'react';

// Using the interface from Architecture.md
interface NFLPlayer {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: 'Active' | 'Injured_Out' | 'Injured_IR' | 'Bye_Week';
  projectedPoints: number;
  // Other fields as needed
}

interface DraftPlayerCardProps {
  player: NFLPlayer;
  onDraft: (playerId: string) => void;
}

const DraftPlayerCard: React.FC<DraftPlayerCardProps> = ({ player, onDraft }) => {
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

  return (
    <div className="card card-side bg-base-100 shadow-sm border border-base-300 hover:border-primary transition-all">
      <div className="card-body p-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">{player.fullName}</h3>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <span>{player.position}</span>
              <span>•</span>
              <span>{player.nflTeamAbbreviation}</span>
              <span>{renderStatus()}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-lg font-semibold">
              {player.projectedPoints.toFixed(1)}
            </div>
            <div className="text-xs text-base-content/70">Projected</div>
          </div>
        </div>
        
        <div className="card-actions justify-end mt-2">
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => onDraft(player.playerId)}
          >
            Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftPlayerCard;