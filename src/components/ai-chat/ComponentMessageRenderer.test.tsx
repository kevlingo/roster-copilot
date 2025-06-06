import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentMessageRenderer from './ComponentMessageRenderer';
import { MessageObject } from '../../types/chat';

// Mock the ArchetypeSelectionComponent
jest.mock('./ArchetypeSelectionComponent', () => {
  return function MockArchetypeSelectionComponent({ onSelection }: { onSelection: (archetype: string) => void }) {
    return (
      <div data-testid="archetype-selection">
        <button onClick={() => onSelection('Eager Learner')}>
          Select Eager Learner
        </button>
      </div>
    );
  };
});

describe('ComponentMessageRenderer', () => {
  const mockOnComponentAction = jest.fn();

  beforeEach(() => {
    mockOnComponentAction.mockClear();
  });

  it('renders nothing for non-component messages', () => {
    const message: MessageObject = {
      id: '1',
      text: 'Regular message',
      sender: 'ai',
      timestamp: new Date(),
      type: 'conversation',
    };

    const { container } = render(
      <ComponentMessageRenderer 
        message={message} 
        onComponentAction={mockOnComponentAction}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders archetype selection component', () => {
    const message: MessageObject = {
      id: '1',
      text: 'Select archetype',
      sender: 'ai',
      timestamp: new Date(),
      type: 'component',
      componentType: 'archetype-selection',
      componentProps: {},
    };

    render(
      <ComponentMessageRenderer 
        message={message} 
        onComponentAction={mockOnComponentAction}
      />
    );

    expect(screen.getByTestId('archetype-selection')).toBeInTheDocument();
  });

  it('handles archetype selection action', () => {
    const message: MessageObject = {
      id: '1',
      text: 'Select archetype',
      sender: 'ai',
      timestamp: new Date(),
      type: 'component',
      componentType: 'archetype-selection',
      componentProps: {},
    };

    render(
      <ComponentMessageRenderer 
        message={message} 
        onComponentAction={mockOnComponentAction}
      />
    );

    fireEvent.click(screen.getByText('Select Eager Learner'));
    
    expect(mockOnComponentAction).toHaveBeenCalledWith('archetype-selected', 'Eager Learner');
  });

  it('renders unknown component type fallback', () => {
    const message: MessageObject = {
      id: '1',
      text: 'Unknown component',
      sender: 'ai',
      timestamp: new Date(),
      type: 'component',
      componentType: 'unknown-type' as 'archetype-selection',
      componentProps: {},
    };

    render(
      <ComponentMessageRenderer 
        message={message} 
        onComponentAction={mockOnComponentAction}
      />
    );

    expect(screen.getByText('Unknown component type: unknown-type')).toBeInTheDocument();
  });
});
