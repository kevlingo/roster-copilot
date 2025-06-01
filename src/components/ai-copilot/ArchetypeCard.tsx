import React from 'react';

interface ArchetypeCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({
  title,
  description,
  icon,
  isSelected,
  onSelect,
}) => {
  return (
    <div 
      className={`card bg-base-100 border hover:shadow-md transition-all cursor-pointer ${
        isSelected 
          ? 'border-primary border-2' 
          : 'border-base-300 hover:border-primary'
      }`}
      onClick={onSelect}
    >
      <div className="card-body p-5">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className={`p-2 rounded-full ${
              isSelected ? 'bg-primary text-primary-content' : 'bg-base-200'
            }`}>
              {icon}
            </div>
          )}
          <h3 className="card-title text-lg">{title}</h3>
        </div>
        
        <p className="text-sm text-base-content/80">{description}</p>
        
        <div className="card-actions justify-end mt-3">
          <button 
            className={`btn ${
              isSelected ? 'btn-primary' : 'btn-outline btn-primary'
            } btn-sm`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              onSelect();
            }}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchetypeCard;