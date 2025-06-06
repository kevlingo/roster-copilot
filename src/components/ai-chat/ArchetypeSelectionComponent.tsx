import React, { useState, useEffect } from 'react';
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
  enableStaggeredAnimation?: boolean;
}

const ArchetypeSelectionComponent: React.FC<ArchetypeSelectionComponentProps> = ({
  onSelection,
  enableStaggeredAnimation = false
}) => {
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  // Handle staggered animation
  useEffect(() => {
    if (enableStaggeredAnimation) {
      // Start with no cards visible
      setVisibleCards([]);

      // Show cards one by one with delay
      ARCHETYPES.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 250); // 250ms delay between each card
      });
    } else {
      // Show all cards immediately
      setVisibleCards(ARCHETYPES.map((_, index) => index));
    }
  }, [enableStaggeredAnimation]);

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
      
      <div className="flex flex-col gap-4">
        {ARCHETYPES.map((archetype, index) => (
          <div
            key={archetype.id}
            className={`transition-all duration-500 ease-out ${
              visibleCards.includes(index)
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{
              transitionDelay: enableStaggeredAnimation ? `${index * 100}ms` : '0ms'
            }}
          >
            <ArchetypeCard
              title={archetype.name}
              description={archetype.description}
              icon={getArchetypeIcon(archetype.id)}
              isSelected={selectedArchetype === archetype.name}
              onSelect={() => handleArchetypeSelect(archetype.name)}
            />
          </div>
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
