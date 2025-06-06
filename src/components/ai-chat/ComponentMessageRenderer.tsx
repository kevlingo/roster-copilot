import React from 'react';
import { MessageObject } from '../../types/chat';
import ArchetypeSelectionComponent from './ArchetypeSelectionComponent';

interface ComponentMessageRendererProps {
  message: MessageObject;
  onComponentAction?: (action: string, data: unknown) => void;
}

const ComponentMessageRenderer: React.FC<ComponentMessageRendererProps> = ({ 
  message, 
  onComponentAction 
}) => {
  if (message.type !== 'component') {
    return null;
  }

  const handleComponentAction = (action: string, data: unknown) => {
    if (onComponentAction) {
      onComponentAction(action, data);
    }
  };

  switch (message.componentType) {
    case 'archetype-selection':
      return (
        <ArchetypeSelectionComponent
          {...(message.componentProps as object)}
          onSelection={(archetype: string) => handleComponentAction('archetype-selected', archetype)}
        />
      );
    
    default:
      return (
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-sm">
            Unknown component type: {message.componentType}
          </p>
        </div>
      );
  }
};

export default ComponentMessageRenderer;
