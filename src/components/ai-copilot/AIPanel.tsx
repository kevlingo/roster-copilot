import React, { useState } from 'react';
import { X, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import { GraduationCap, BarChart2, Zap, Clock } from 'lucide-react';
import ArchetypeCard from './ArchetypeCard';

interface AIPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  title?: string;
  children: React.ReactNode;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const archetypes = [
  {
    id: 'eager_learner',
    title: 'Eager Learner',
    description: 'New to fantasy football or still learning. I want clear guidance and simple explanations.',
    icon: <GraduationCap size={24} />,
  },
  {
    id: 'calculated_strategist',
    title: 'Calculated Strategist',
    description: 'Experienced player who enjoys planning and optimizing. I appreciate efficiency and data.',
    icon: <BarChart2 size={24} />,
  },
  {
    id: 'bold_playmaker',
    title: 'Bold Playmaker',
    description: 'Experienced player willing to take risks. I value high-upside opportunities.',
    icon: <Zap size={24} />,
  },
  {
    id: 'busy_optimizer',
    title: 'Busy Optimizer',
    description: 'Time-constrained player looking for quick, efficient management.',
    icon: <Clock size={24} />,
  },
];

const AIPanel: React.FC<AIPanelProps> = ({ 
  isOpen, 
  onToggleOpen, 
  title = "AI Copilot", 
  children,
  isMinimized = false,
  onToggleMinimize = () => {}
}) => {
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  
  // For mobile detection (can be replaced with a proper hook)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  // On mobile, panel should take full screen when open
  const mobileStyles = isMobile ? (
    isOpen ? "fixed inset-0 z-50 flex flex-col" : "hidden"
  ) : "";
  
  // On desktop, panel should slide in from the right
  const desktopStyles = !isMobile ? (
    isOpen 
      ? "fixed top-0 right-0 bottom-0 w-80 md:w-96 z-40 flex flex-col transform translate-x-0 transition-transform"
      : "fixed top-0 right-0 bottom-0 w-80 md:w-96 z-40 flex flex-col transform translate-x-full transition-transform"
  ) : "";
  
  // If minimized on desktop, show just the header
  const minimizedStyles = !isMobile && isMinimized && isOpen
    ? "h-auto" 
    : "h-full";

  return (
    <>
      {/* Floating action button for mobile */}
      {isMobile && !isOpen && (
        <button 
          onClick={onToggleOpen}
          className="fixed bottom-4 right-4 z-30 btn btn-primary btn-circle shadow-lg"
          aria-label="Open AI Copilot"
        >
          <MessageSquare size={24} />
        </button>
      )}
      
      {/* Main panel */}
      <div className={`bg-base-100 border-l border-base-300 shadow-xl ${mobileStyles} ${desktopStyles} ${minimizedStyles}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-primary text-primary-content">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <button 
                onClick={onToggleMinimize} 
                className="btn btn-ghost btn-sm btn-circle"
                aria-label={isMinimized ? "Maximize panel" : "Minimize panel"}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
            )}
            <button 
              onClick={onToggleOpen} 
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Content area - only show if not minimized */}
        {(!isMinimized || isMobile) && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-lg">Welcome to Roster Copilot!</h3>
                <p className="text-base-content/80">I'm your AI fantasy football assistant. Let's get to know each other better.</p>
                <p className="text-base-content/80 mt-2">First, let's figure out what kind of fantasy manager you are...</p>
              </div>
              
              <div className="space-y-3">
                {archetypes.map(archetype => (
                  <ArchetypeCard
                    key={archetype.id}
                    title={archetype.title}
                    description={archetype.description}
                    icon={archetype.icon}
                    isSelected={selectedArchetype === archetype.id}
                    onSelect={() => setSelectedArchetype(archetype.id)}
                  />
                ))}
              </div>
              
              {selectedArchetype && (
                <div className="text-center">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      // Handle archetype selection
                      console.log('Selected archetype:', selectedArchetype);
                    }}
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Background overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={onToggleOpen}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default AIPanel;