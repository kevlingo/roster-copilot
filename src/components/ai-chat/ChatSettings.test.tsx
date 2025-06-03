import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatSettings from './ChatSettings';

describe('ChatSettings Component', () => {
  const mockOnClearHistory = jest.fn();
  const originalConfirm = window.confirm;

  beforeEach(() => {
    // Reset mock before each test
    mockOnClearHistory.mockClear();
    // Mock window.confirm
    window.confirm = jest.fn();
  });

  afterEach(() => {
    // Restore original window.confirm after each test
    window.confirm = originalConfirm;
  });

  test('renders the settings icon button', () => {
    render(<ChatSettings onClearHistory={mockOnClearHistory} />);
    const settingsButton = screen.getByLabelText('Chat settings');
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton.tagName).toBe('BUTTON');
    // Check for ARIA attributes
    expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    expect(settingsButton).toHaveAttribute('aria-haspopup', 'true');
    expect(settingsButton).toHaveAttribute('id', 'chat-settings-button');
  });

  test('toggles popover visibility on icon click', () => {
    render(<ChatSettings onClearHistory={mockOnClearHistory} />);
    const settingsButton = screen.getByLabelText('Chat settings');

    // Popover should not be visible initially
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(settingsButton).toHaveAttribute('aria-expanded', 'false');

    // Click to open popover
    fireEvent.click(settingsButton);
    const popover = screen.getByRole('menu');
    expect(popover).toBeInTheDocument();
    expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
    expect(popover).toHaveAttribute('aria-labelledby', 'chat-settings-button');


    // Click again to close popover
    fireEvent.click(settingsButton);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('popover contains "Clear Chat History" button', () => {
    render(<ChatSettings onClearHistory={mockOnClearHistory} />);
    const settingsButton = screen.getByLabelText('Chat settings');
    fireEvent.click(settingsButton); // Open popover

    const clearButton = screen.getByRole('menuitem', { name: 'Clear Chat History' });
    expect(clearButton).toBeInTheDocument();
  });

  test('calls onClearHistory and closes popover after confirmation', () => {
    (window.confirm as jest.Mock).mockReturnValue(true); // Simulate user confirming
    render(<ChatSettings onClearHistory={mockOnClearHistory} />);
    const settingsButton = screen.getByLabelText('Chat settings');
    fireEvent.click(settingsButton); // Open popover

    const clearButton = screen.getByRole('menuitem', { name: 'Clear Chat History' });
    fireEvent.click(clearButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to clear the chat history? This cannot be undone.'
    );
    expect(mockOnClearHistory).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(); // Popover should close
  });

  test('does not call onClearHistory and closes popover if confirmation is denied', () => {
    (window.confirm as jest.Mock).mockReturnValue(false); // Simulate user denying
    render(<ChatSettings onClearHistory={mockOnClearHistory} />);
    const settingsButton = screen.getByLabelText('Chat settings');
    fireEvent.click(settingsButton); // Open popover

    const clearButton = screen.getByRole('menuitem', { name: 'Clear Chat History' });
    fireEvent.click(clearButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to clear the chat history? This cannot be undone.'
    );
    expect(mockOnClearHistory).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(); // Popover should still close
  });

  test('popover is accessible with correct ARIA roles', () => {
    render(<ChatSettings onClearHistory={mockOnClearHistory} />);
    const settingsButton = screen.getByLabelText('Chat settings');
    fireEvent.click(settingsButton); // Open popover

    const popover = screen.getByRole('menu');
    expect(popover).toHaveAttribute('aria-orientation', 'vertical');
    expect(popover).toHaveAttribute('aria-labelledby', 'chat-settings-button');

    const clearButton = screen.getByRole('menuitem', { name: 'Clear Chat History' });
    expect(clearButton).toBeInTheDocument();
  });
});