import React, { useState, useEffect } from 'react';
import { User, TrendingUp, AlertCircle, Info } from 'lucide-react';
import Modal from '@/src/components/core/Modal';

// Player interface matching the API response
interface NFLPlayer {
  playerId: string;
  fullName: string;
  position: "QB" | "RB" | "WR" | "TE" | "K" | "DEF";
  nflTeamAbbreviation: string;
  status?: "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week";
  projectedPoints?: number;
  keyAttributes?: {
    consistencyRating?: "High" | "Medium" | "Low";
    upsidePotential?: "High" | "Medium" | "Low";
    role?: string;
  };
  notes?: string;
}

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string | null;
}

const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  playerId
}) => {
  const [player, setPlayer] = useState<NFLPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch player data when modal opens and playerId changes
  useEffect(() => {
    if (isOpen && playerId) {
      fetchPlayerData(playerId);
    }
  }, [isOpen, playerId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPlayer(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchPlayerData = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/players/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Player not found');
        } else if (response.status === 401) {
          throw new Error('Authentication required');
        } else {
          throw new Error('Failed to load player data');
        }
      }

      const data = await response.json();
      setPlayer(data.player);
    } catch (err) {
      console.error('Error fetching player data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load player data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatus = (status?: string) => {
    switch (status) {
      case 'Active':
        return <span className="badge badge-success">Active</span>;
      case 'Injured_Out':
        return <span className="badge badge-error">OUT</span>;
      case 'Injured_Questionable':
        return <span className="badge badge-warning">Questionable</span>;
      case 'Bye Week':
        return <span className="badge badge-info">BYE</span>;
      default:
        return <span className="badge badge-neutral">{status || 'Unknown'}</span>;
    }
  };

  const renderRating = (rating?: string) => {
    const colorClass = rating === 'High' ? 'text-success' : 
                      rating === 'Medium' ? 'text-warning' : 
                      rating === 'Low' ? 'text-error' : 'text-base-content/70';
    return <span className={colorClass}>{rating || 'N/A'}</span>;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <span className="loading loading-spinner loading-lg" role="status" aria-label="Loading"></span>
          <p className="mt-4 text-base-content/70">Loading player details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle size={48} className="text-error mb-4" />
          <p className="text-error text-center">{error}</p>
          <button 
            onClick={() => playerId && fetchPlayerData(playerId)}
            className="btn btn-primary btn-sm mt-4"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!player) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Info size={48} className="text-base-content/50 mb-4" />
          <p className="text-base-content/70">No player data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Player Header */}
        <div className="flex items-start gap-4">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-16 h-16">
              <User size={32} />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{player.fullName}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="badge badge-outline badge-lg">{player.position}</span>
              <span className="badge badge-outline">{player.nflTeamAbbreviation}</span>
              {renderStatus(player.status)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {player.projectedPoints?.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-base-content/70">Projected Points</div>
          </div>
        </div>

        {/* Key Attributes */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h4 className="card-title text-lg flex items-center gap-2">
              <TrendingUp size={20} />
              Player Attributes
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-base-content/70">Consistency</div>
                <div className="font-semibold">
                  {renderRating(player.keyAttributes?.consistencyRating)}
                </div>
              </div>

              <div>
                <div className="text-sm text-base-content/70">Upside Potential</div>
                <div className="font-semibold">
                  {renderRating(player.keyAttributes?.upsidePotential)}
                </div>
              </div>

              <div>
                <div className="text-sm text-base-content/70">Role</div>
                <div className="font-semibold">
                  {player.keyAttributes?.role || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {player.notes && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-lg flex items-center gap-2">
                <Info size={20} />
                Notes & Updates
              </h4>
              <p className="text-base-content/80">{player.notes}</p>
            </div>
          </div>
        )}

        {/* Data Source Notice */}
        <div className="text-center text-sm text-base-content/50">
          <p>Data sourced from PoC static dataset</p>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={player ? `${player.fullName} - Player Profile` : 'Player Profile'}
      size="lg"
    >
      {renderContent()}
    </Modal>
  );
};

export default PlayerProfileModal;
