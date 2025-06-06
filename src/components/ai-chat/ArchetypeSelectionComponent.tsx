import React, { useState } from 'react';
import ArchetypeCard from '../ai-copilot/ArchetypeCard';
import { ARCHETYPES } from '../../lib/conversation/archetype-onboarding';
import { 
  UserIcon, 
  ChartBarIcon, 
  BoltIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

interface ArchetypeSelectionComponentProps {
  onSelection: (archetypeName: string) => void;
}

const ArchetypeSelectionComponent: React.FC<ArchetypeSelectionComponentProps> = ({ 
  onSelection 
}) => {
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);

  // Icon mapping for each archetype
  const getArchetypeIcon = (archetypeId: string) => {
    switch (archetypeId) {
      case 'eager-learner':
        return <UserIcon className="w-5 h-5" />;
      case 'calculated-strategist':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'bold-playmaker':
        return <BoltIcon className="w-5 h-5" />;
      case 'busy-optimizer':
        return <ClockIcon className="w-5 h-5" />;
      default:
        return <UserIcon className="w-5 h-5" />;
    }
  };

  const handleArchetypeSelect = (archetypeName: string) => {
    setSelectedArchetype(archetypeName);
    // Small delay to show selection state before triggering callback
    setTimeout(() => {
      onSelection(archetypeName);
    }, 300);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Choose Your Fantasy Manager Archetype
        </h3>
        <p className="text-sm text-gray-600">
          Select the style that best matches your approach to fantasy football:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ARCHETYPES.map((archetype) => (
          <ArchetypeCard
            key={archetype.id}
            title={archetype.name}
            description={archetype.description}
            icon={getArchetypeIcon(archetype.id)}
            isSelected={selectedArchetype === archetype.name}
            onSelect={() => handleArchetypeSelect(archetype.name)}
          />
        ))}
      </div>
      
      {selectedArchetype && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            Great choice! Processing your selection...
          </p>
        </div>
      )}
    </div>
  );
};

export default ArchetypeSelectionComponent;
