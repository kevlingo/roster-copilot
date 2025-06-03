import React from 'react';
import { render, screen } from '@testing-library/react'; // Removed fireEvent
import '@testing-library/jest-dom';
import ChatBubbleOverlay from './ChatBubbleOverlay';
import { MessageObject } from '../../types/chat';

const mockMessages: MessageObject[] = [
  { id: '1', text: 'Hello User', sender: 'ai', timestamp: new Date() },
  { id: '2', text: 'Hello AI', sender: 'user', timestamp: new Date() },
  { id: '3', text: 'How are you?', sender: 'ai', timestamp: new Date() },
];

// Remove mockOnHideOverlay and mockOnClearHistory as they are no longer props
// const mockOnHideOverlay = jest.fn();
// const mockOnClearHistory = jest.fn();
// const originalConfirm = window.confirm; // Keep for ChatSettings if it were still here. Removed as it's no longer used.

describe('ChatBubbleOverlay', () => {
  beforeEach(() => {
    // Reset mocks before each test
    // mockOnHideOverlay.mockClear(); // Removed
    // mockOnClearHistory.mockClear(); // Removed
    // Mock scrollIntoView as it's not implemented in JSDOM
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    // window.confirm = jest.fn(); // No longer needed here as ChatSettings is removed
  });

  afterEach(() => {
    // Restore original window.confirm after each test
    // window.confirm = originalConfirm; // No longer needed here
  });

  it('AC6: renders correctly when visible', () => {
    render(
      <ChatBubbleOverlay
        messages={mockMessages}
        isVisible={true}
        // onHideOverlay and onClearHistory removed
      />
    );
    expect(screen.getByRole('log')).toBeInTheDocument();
    const messageTexts = mockMessages.map(msg => msg.text);
    messageTexts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
    const logContainer = screen.getByRole('log');
    const messagesEndSentinel = screen.getByTestId('messages-end-sentinel');
    expect(logContainer.firstChild).toBe(messagesEndSentinel); // Crucial for flex-col-reverse
    expect(logContainer.children.length).toBe(mockMessages.length + 1); // +1 for the messagesEndRef div
    // Assert that HideChatButton and ChatSettings are NOT present
    expect(screen.queryByLabelText('Hide chat messages')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Chat settings')).not.toBeInTheDocument();
  });

  it('AC6: does not render when isVisible is false', () => {
    render(
      <ChatBubbleOverlay
        messages={mockMessages}
        isVisible={false}
        // onHideOverlay and onClearHistory removed
      />
    );
    expect(screen.queryByRole('log')).not.toBeInTheDocument();
  });

  it('AC7: renders the correct number of messages', () => {
    render(
      <ChatBubbleOverlay
        messages={mockMessages}
        isVisible={true}
        // onHideOverlay and onClearHistory removed
      />
    );
    expect(screen.getAllByText(/Hello User|Hello AI|How are you\?/).length).toBeGreaterThanOrEqual(mockMessages.length);
  });
  
  // Remove tests for HideChatButton and ChatSettings functionality
  // it('calls onHideOverlay when hide button is clicked', () => { ... });
  // it('calls onClearHistory via ChatSettings component after confirmation', () => { ... });

  it('AC9 & AC10: has correct ARIA attributes and is keyboard accessible', () => {
    render(
      <ChatBubbleOverlay
        messages={mockMessages}
        isVisible={true}
        // onHideOverlay and onClearHistory removed
      />
    );
    const logElement = screen.getByRole('log');
    expect(logElement).toHaveAttribute('aria-live', 'polite');
    expect(logElement).toHaveAttribute('aria-atomic', 'false');
    expect(logElement).toHaveAttribute('aria-relevant', 'additions text');
    expect(logElement).toHaveAttribute('tabindex', '0'); // AC9
  });
  
  it('AC4 & AC8: calls scrollIntoView with "auto" behavior on the sentinel when messages change or on initial visible render', () => {
    const { rerender } = render(
      <ChatBubbleOverlay
        messages={mockMessages.slice(0, 1)} // Initial messages
        isVisible={true}
      />
    );
    // scrollIntoView should have been called for initial render with correct behavior
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    
    // Clear mock for the next check
    (window.HTMLElement.prototype.scrollIntoView as jest.Mock).mockClear();

    const newMessages: MessageObject[] = [
        ...mockMessages,
        { id: '4', text: 'A new message!', sender: 'user', timestamp: new Date() }
    ];
    rerender(
        <ChatBubbleOverlay
            messages={newMessages}
            isVisible={true}
        />
    );
    // scrollIntoView should be called again with correct behavior when messages array changes
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
  });
});