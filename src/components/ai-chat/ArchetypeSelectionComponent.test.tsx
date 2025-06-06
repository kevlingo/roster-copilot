import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArchetypeSelectionComponent from './ArchetypeSelectionComponent';

// Mock the ArchetypeCard component
jest.mock('../ai-copilot/ArchetypeCard', () => {
  return function MockArchetypeCard({ 
    title, 
    description, 
    isSelected, 
    onSelect 
  }: { 
    title: string; 
    description: string; 
    isSelected: boolean; 
    onSelect: () => void; 
  }) {
    return (
      <div 
        data-testid={`archetype-card-${title.toLowerCase().replace(' ', '-')}`}
        className={isSelected ? 'selected' : ''}
        onClick={onSelect}
      >
        <h3>{title}</h3>
        <p>{description}</p>
        {isSelected && <span data-testid="selected-indicator">Selected</span>}
      </div>
    );
  };
});

describe('ArchetypeSelectionComponent', () => {
  const mockOnSelection = jest.fn();

  beforeEach(() => {
    mockOnSelection.mockClear();
  });

  it('renders all archetype cards', () => {
    render(<ArchetypeSelectionComponent onSelection={mockOnSelection} />);

    expect(screen.getByTestId('archetype-card-eager-learner')).toBeInTheDocument();
    expect(screen.getByTestId('archetype-card-calculated-strategist')).toBeInTheDocument();
    expect(screen.getByTestId('archetype-card-bold-playmaker')).toBeInTheDocument();
    expect(screen.getByTestId('archetype-card-busy-optimizer')).toBeInTheDocument();
  });

  it('displays the correct titles and descriptions', () => {
    render(<ArchetypeSelectionComponent onSelection={mockOnSelection} />);

    expect(screen.getByText('Eager Learner')).toBeInTheDocument();
    expect(screen.getByText('Calculated Strategist')).toBeInTheDocument();
    expect(screen.getByText('Bold Playmaker')).toBeInTheDocument();
    expect(screen.getByText('Busy Optimizer')).toBeInTheDocument();

    // Check for description text (partial match)
    expect(screen.getByText(/understanding the "why" behind every decision/)).toBeInTheDocument();
  });

  it('handles archetype selection with delay', async () => {
    render(<ArchetypeSelectionComponent onSelection={mockOnSelection} />);

    const eagerLearnerCard = screen.getByTestId('archetype-card-eager-learner');
    fireEvent.click(eagerLearnerCard);

    // Check that selection state is updated immediately
    expect(eagerLearnerCard).toHaveClass('selected');
    expect(screen.getByTestId('selected-indicator')).toBeInTheDocument();

    // Check that processing message appears
    expect(screen.getByText('Great choice! Processing your selection...')).toBeInTheDocument();

    // Wait for the callback to be called after delay
    await waitFor(() => {
      expect(mockOnSelection).toHaveBeenCalledWith('Eager Learner');
    }, { timeout: 500 });
  });

  it('shows only one selection at a time', async () => {
    render(<ArchetypeSelectionComponent onSelection={mockOnSelection} />);

    // Select first archetype
    fireEvent.click(screen.getByTestId('archetype-card-eager-learner'));
    expect(screen.getByTestId('archetype-card-eager-learner')).toHaveClass('selected');

    // Select second archetype
    fireEvent.click(screen.getByTestId('archetype-card-calculated-strategist'));
    
    // First should no longer be selected, second should be selected
    expect(screen.getByTestId('archetype-card-eager-learner')).not.toHaveClass('selected');
    expect(screen.getByTestId('archetype-card-calculated-strategist')).toHaveClass('selected');
  });

  it('displays header text correctly', () => {
    render(<ArchetypeSelectionComponent onSelection={mockOnSelection} />);

    expect(screen.getByText('Choose Your Fantasy Manager Archetype')).toBeInTheDocument();
    expect(screen.getByText('Select the style that best matches your approach to fantasy football:')).toBeInTheDocument();
  });
});
