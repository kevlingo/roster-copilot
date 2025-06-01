import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

type InsightCategory = 'waiver' | 'lineup' | 'trade' | 'matchup' | 'alert';

interface InsightCardProps {
  title: string;
  description: string;
  category: InsightCategory;
  actionLabel?: string;
  onAction?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  category,
  actionLabel,
  onAction,
  onThumbsUp,
  onThumbsDown,
}) => {
  // Category specific styling
  const getCategoryStyles = () => {
    switch (category) {
      case 'waiver':
        return 'border-l-blue-500';
      case 'lineup':
        return 'border-l-green-500';
      case 'trade':
        return 'border-l-purple-500';
      case 'matchup':
        return 'border-l-orange-500';
      case 'alert':
        return 'border-l-red-500';
      default:
        return 'border-l-primary';
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'waiver':
        return <div className="badge badge-primary">Waiver</div>;
      case 'lineup':
        return <div className="badge badge-success">Lineup</div>;
      case 'trade':
        return <div className="badge badge-secondary">Trade</div>;
      case 'matchup':
        return <div className="badge badge-warning">Matchup</div>;
      case 'alert':
        return <div className="badge badge-error">Alert</div>;
      default:
        return null;
    }
  };

  return (
    <div className={`card bg-base-100 border-l-4 ${getCategoryStyles()} shadow-sm hover:shadow-md transition-all`}>
      <div className="card-body p-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="mb-1">{getCategoryIcon()}</div>
            <h3 className="card-title text-base">{title}</h3>
            <p className="text-sm text-base-content/80 mt-1">{description}</p>
          </div>
        </div>
        
        <div className="card-actions justify-between mt-3 flex-wrap">
          {actionLabel && onAction && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          )}
          
          <div className="flex items-center gap-2">
            {onThumbsUp && (
              <button 
                className="btn btn-ghost btn-sm btn-circle"
                onClick={onThumbsUp}
                aria-label="This was helpful"
              >
                <ThumbsUp size={16} />
              </button>
            )}
            
            {onThumbsDown && (
              <button 
                className="btn btn-ghost btn-sm btn-circle"
                onClick={onThumbsDown}
                aria-label="This was not helpful"
              >
                <ThumbsDown size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;