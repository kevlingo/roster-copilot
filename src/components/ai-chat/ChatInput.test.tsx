import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from './ChatInput';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  SendHorizontal: () => <svg data-testid="send-icon" />,
  X: () => <svg data-testid="hide-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
}));

// Mock child components to simplify testing ChatInput itself
jest.mock('./buttons/HideChatButton', () => {
  return jest.fn(({ onClick, isChatVisible }) => (
    <button data-testid="mock-hide-button" onClick={onClick} aria-pressed={isChatVisible}>
      {isChatVisible ? 'Hide' : 'Show'}
    </button>
  ));
});

jest.mock('./ChatSettings', () => {
  return jest.fn(({ onClearHistory }) => (
    <button data-testid="mock-settings-button" onClick={() => {
      // Simulate the confirmation behavior of the actual component
      // For testing, we assume user confirms.
      if (window.confirm("Are you sure?")) { // Or simply call onClearHistory for test purposes
        onClearHistory();
      }
    }}>Settings</button>
  ));
});


describe('ChatInput Component', () => {
  const mockOnInputChange = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnHideOverlay = jest.fn();
  const mockOnClearHistory = jest.fn();

  const defaultProps = {
    inputValue: "",
    onInputChange: mockOnInputChange,
    onSubmit: mockOnSubmit,
    onHideOverlay: mockOnHideOverlay,
    onClearHistory: mockOnClearHistory,
    isChatOverlayVisible: true, // Default to visible for most tests
  };

  beforeEach(() => {
    mockOnInputChange.mockClear();
    mockOnSubmit.mockClear();
    mockOnHideOverlay.mockClear();
    mockOnClearHistory.mockClear();
    // Reset window.confirm mock for ChatSettings tests
    window.confirm = jest.fn(() => true);
  });

  it('renders the textarea, send button, hide button, and settings button', () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
    expect(screen.getByTestId('send-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mock-hide-button')).toBeInTheDocument();
    expect(screen.getByText('Hide')).toBeInTheDocument(); // Check initial state based on isChatOverlayVisible = true
    expect(screen.getByTestId('mock-settings-button')).toBeInTheDocument();
  });

  it('renders HideChatButton with "Show" when isChatOverlayVisible is false', () => {
    render(<ChatInput {...defaultProps} isChatOverlayVisible={false} />);
    expect(screen.getByTestId('mock-hide-button')).toBeInTheDocument();
    expect(screen.getByText('Show')).toBeInTheDocument();
    expect(screen.getByTestId('mock-hide-button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onInputChange when text is typed into the textarea', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, 'Hello there');
    expect(mockOnInputChange).toHaveBeenCalled(); // Simplified check
  });

  it('calls onSubmit when the send button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} inputValue="Test message" />);
    const sendButton = screen.getByRole('button', { name: 'Send message' });
    await user.click(sendButton);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onHideOverlay when the hide button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);
    const hideButton = screen.getByTestId('mock-hide-button');
    await user.click(hideButton);
    expect(mockOnHideOverlay).toHaveBeenCalledTimes(1);
  });

  it('calls onClearHistory when the settings button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);
    const settingsButton = screen.getByTestId('mock-settings-button');
    await user.click(settingsButton);
    expect(window.confirm).toHaveBeenCalledWith("Are you sure?"); // from mock ChatSettings
    expect(mockOnClearHistory).toHaveBeenCalledTimes(1);
  });


  it('calls onSubmit when Enter key is pressed (and not Shift+Enter)', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} inputValue="Test message" />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, '{enter}');
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not call onSubmit when Shift+Enter key is pressed', async () => {
    render(<ChatInput {...defaultProps} inputValue="Test message" />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays the provided inputValue', () => {
    render(<ChatInput {...defaultProps} inputValue="Initial value" />);
    expect(screen.getByDisplayValue('Initial value')).toBeInTheDocument();
  });

  it('is disabled when isDisabled prop is true', () => {
    render(<ChatInput {...defaultProps} isDisabled={true} />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
    // Hide and Settings buttons are part of child components,
    // their disabled state would be managed within those or by not passing onClick handlers.
    // For this test, we primarily check the main input and send button.
  });

  it('does not call onSubmit when button is clicked if disabled', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} inputValue="test" isDisabled={true} />);
    const sendButton = screen.getByRole('button', { name: 'Send message' });
    await user.click(sendButton);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit on Enter key press if disabled', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} inputValue="test" isDisabled={true} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, '{enter}');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('uses the custom placeholder if provided', () => {
    const customPlaceholder = "Ask me anything...";
    render(<ChatInput {...defaultProps} placeholder={customPlaceholder} />);
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

});