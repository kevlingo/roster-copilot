import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import HideChatButton from './HideChatButton';

describe('HideChatButton', () => {
  it('renders correctly with EyeOff icon and "Hide chat history" label when chat is visible', () => {
    const handleClick = jest.fn();
    render(<HideChatButton onClick={handleClick} isChatVisible={true} />);

    const buttonElement = screen.getByRole('button', { name: /hide chat history/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveAttribute('aria-pressed', 'true');
    expect(buttonElement).toHaveAttribute('title', 'Hide chat history');

    // Check for EyeOff icon
    // Assuming EyeOff icon is rendered, one might check for its specific class or structure
    // For simplicity, we're relying on the aria-label and aria-pressed state.
    // A more robust test could involve checking for the specific SVG path of EyeOff if stable.
    expect(buttonElement.querySelector('svg')).toBeInTheDocument(); // Basic check for any SVG
    // To be more specific if EyeOff had a unique class from lucide-react like 'lucide-eye-off':
    // expect(buttonElement.querySelector('.lucide-eye-off')).toBeInTheDocument();
  });

  it('renders correctly with Eye icon and "Show chat history" label when chat is hidden', () => {
    const handleClick = jest.fn();
    render(<HideChatButton onClick={handleClick} isChatVisible={false} />);

    const buttonElement = screen.getByRole('button', { name: /show chat history/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveAttribute('aria-pressed', 'false');
    expect(buttonElement).toHaveAttribute('title', 'Show chat history');

    // Check for Eye icon
    expect(buttonElement.querySelector('svg')).toBeInTheDocument(); // Basic check for any SVG
    // To be more specific if Eye had a unique class from lucide-react like 'lucide-eye':
    // expect(buttonElement.querySelector('.lucide-eye')).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<HideChatButton onClick={handleClick} isChatVisible={true} />);

    const buttonElement = screen.getByRole('button', { name: /hide chat history/i });
    fireEvent.click(buttonElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is focusable and can be activated with keyboard', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<HideChatButton onClick={handleClick} isChatVisible={true} />);
    const buttonElement = screen.getByRole('button', { name: /hide chat history/i });

    // Check focus
    buttonElement.focus(); // Focus the button programmatically first for the check
    expect(buttonElement).toHaveFocus();

    // Simulate Enter key press
    // For userEvent, often just typing the key on the focused element is enough
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Simulate Space key press
    // Ensure focus is still on the button or re-focus if necessary for isolated keyboard event testing.
    // Since user.keyboard sends events to document.body if not specified, let's re-ensure focus or target.
    // However, if the element that had focus before ({Enter}) was the button, it should still have it.
    await user.keyboard('{ }'); // {space} is an alias for ' '
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});