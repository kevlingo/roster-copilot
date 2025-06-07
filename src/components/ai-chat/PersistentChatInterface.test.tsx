import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersistentChatInterface from './PersistentChatInterface';
import { ChatInputProps } from './ChatInput'; // Correct top-level import
import { MessageObject } from '../../types/chat'; // Correct top-level import

// Mock uuid to return predictable IDs for snapshots and assertions
let idCounter = 0;
jest.mock('uuid', () => ({ v4: () => `test-uuid-${idCounter++}` }));

// Mock AI notification hook
jest.mock('../../hooks/useAINotification', () => ({
  setGlobalNotificationHandler: jest.fn(),
  createAINotificationMessage: jest.fn(),
}));

// Define MockChatBubbleOverlayProps at the top level
interface MockChatBubbleOverlayProps {
  messages: MessageObject[];
  isVisible: boolean;
  // onHideOverlay and onClearHistory are no longer props of ChatBubbleOverlay
}

// Update ChatInputProps to include the new handlers for the mock
interface MockChatInputProps extends ChatInputProps {
    onHideOverlay: () => void;
    onClearHistory: () => void;
}

// Mock child components to isolate testing of PersistentChatInterface
jest.mock('./ChatInput', () => {
  const ChatInput = React.forwardRef<HTMLTextAreaElement, MockChatInputProps>( // Use updated MockChatInputProps
    ({ inputValue, onInputChange, onSubmit, isDisabled, onHideOverlay, onClearHistory }, ref) => (
    <div data-testid="chat-input">
      <textarea
        ref={ref}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        disabled={isDisabled}
        data-testid="chat-input-textarea"
      />
      <button onClick={onSubmit} data-testid="chat-input-submit" disabled={isDisabled}>Send</button>
      {/* Add mock buttons for Hide and Clear History */}
      <button onClick={onHideOverlay} data-testid="mock-hide-button-within-input">HideOverlay</button>
      <button onClick={onClearHistory} data-testid="mock-clear-button-within-input">ClearHistory</button>
    </div>
  ));
  ChatInput.displayName = 'ChatInput';
  return ChatInput;
});
  
jest.mock('./ChatBubbleOverlay', () => {
    const MockedChatBubbleOverlay: React.FC<MockChatBubbleOverlayProps> = ({ messages, isVisible }) => {
        if (!isVisible) return null;
        return (
          // The actual ChatBubbleOverlay does not have hide/clear buttons anymore
          <div data-testid="chat-bubble-overlay">
            <div data-testid="message-list">
                {messages.map((msg: MessageObject) => (
                    <div key={msg.id} data-testid={`message-${msg.id}`}>
                        {msg.text} ({msg.sender})
                    </div>
                ))}
            </div>
          </div>
        );
    };
    MockedChatBubbleOverlay.displayName = 'ChatBubbleOverlay';
    return MockedChatBubbleOverlay;
});


describe('PersistentChatInterface', () => {
  beforeEach(() => {
    idCounter = 0;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders ChatInput and ChatBubbleOverlay initially', () => {
    render(<PersistentChatInterface />);
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    expect(screen.getByTestId('chat-bubble-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input-textarea')).toBeInTheDocument();
  });

  test('handles input change', () => {
    render(<PersistentChatInterface />);
    const textarea = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello AI' } });
    expect(textarea.value).toBe('Hello AI');
  });

  test('sends a message, updates chat history, and simulates AI response', async () => {
    render(<PersistentChatInterface />);
    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-submit');

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByTestId('message-test-uuid-0')).toHaveTextContent('Test message (user)');
    });
    expect((textarea as HTMLTextAreaElement).value).toBe('');
    
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
        expect(screen.getByTestId('message-test-uuid-1')).toHaveTextContent('AI Echo: "Test message" (ai)');
    });
  });

  test('toggles overlay visibility via ChatInput', () => {
    render(<PersistentChatInterface />);
    // Interact with the hide button now part of the ChatInput mock
    const hideButtonInInput = screen.getByTestId('mock-hide-button-within-input');
    
    expect(screen.getByTestId('chat-bubble-overlay')).toBeVisible();
    fireEvent.click(hideButtonInInput); // Click the hide button in ChatInput
    // ChatBubbleOverlay's mock returns null when isVisible is false
    expect(screen.queryByTestId('chat-bubble-overlay')).not.toBeInTheDocument();
    
  });

  test('clears chat history via ChatInput', async () => {
    render(<PersistentChatInterface />);
    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-submit');
    // Interact with the clear button now part of the ChatInput mock
    const clearButtonInInput = screen.getByTestId('mock-clear-button-within-input');

    fireEvent.change(textarea, { target: { value: 'Message to clear' } });
    fireEvent.click(sendButton);
    await waitFor(() => {
      // Message list should be part of ChatBubbleOverlay mock
      expect(screen.getByTestId('message-list').querySelector(`[data-testid="message-test-uuid-0"]`)).toHaveTextContent('Message to clear (user)');
    });
    
    jest.advanceTimersByTime(2000);
     await waitFor(() => {
        expect(screen.getByTestId('message-list').querySelector(`[data-testid="message-test-uuid-1"]`)).toHaveTextContent('AI Echo: "Message to clear" (ai)');
    });

    fireEvent.click(clearButtonInInput); // Click the clear button in ChatInput
    await waitFor(() => {
      const messageList = screen.getByTestId('message-list');
      // The mock for ChatBubbleOverlay should re-render with an empty messages array
      expect(messageList.children.length).toBe(0);
    });
  });

  test('input is disabled while AI is loading response', async () => {
    render(<PersistentChatInterface />);
    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-submit');

    fireEvent.change(textarea, { target: { value: 'Test loading state' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(textarea).toBeDisabled();
      expect(sendButton).toBeDisabled(); // Assuming ChatInput mock passes isDisabled to its button
    });

    jest.advanceTimersByTime(2000); // Simulate AI response time

    await waitFor(() => {
      expect(textarea).not.toBeDisabled();
      expect(sendButton).not.toBeDisabled();
    });
  });

  test('shows overlay if hidden when a new message is sent', async () => {
    render(<PersistentChatInterface />);
    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-submit');
    const hideButtonInInput = screen.getByTestId('mock-hide-button-within-input');

    // Hide the overlay first
    fireEvent.click(hideButtonInInput);
    expect(screen.queryByTestId('chat-bubble-overlay')).not.toBeInTheDocument();

    // Send a message
    fireEvent.change(textarea, { target: { value: 'Show yourself!' } });
    fireEvent.click(sendButton);

    // Wait for user message to appear (which implies AI response processing starts)
    await waitFor(() => {
      // Even before AI response, the overlay should become visible due to the new logic
      expect(screen.getByTestId('chat-bubble-overlay')).toBeVisible();
      expect(screen.getByTestId('message-test-uuid-0')).toHaveTextContent('Show yourself! (user)');
    });
    
    // Advance timers for AI response
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByTestId('message-test-uuid-1')).toHaveTextContent('AI Echo: "Show yourself!" (ai)');
      // Overlay should remain visible
      expect(screen.getByTestId('chat-bubble-overlay')).toBeVisible();
    });
  });

  test('focuses input after sending a message and receiving AI response', async () => {
    render(<PersistentChatInterface />);
    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-submit');

    // The ref in the actual component is `chatInputRef`, which is passed to the mocked ChatInput.
    // The mocked ChatInput applies this ref to its own textarea.
    // We need to simulate this by attaching a spy to the actual textarea's focus method.
    // However, directly spying on `textarea.focus` within the test environment might be tricky
    // if the ref is not directly exposed or if the mock structure complicates it.

    // A more robust way, given the mock setup, is to check document.activeElement.
    // Or, if ChatInput mock could accept a spy for its focus method, that would be cleaner.
    // For now, let's assume the mock correctly forwards the ref and focus() call.

    fireEvent.change(textarea, { target: { value: 'Focus test' } });
    fireEvent.click(sendButton);

    // Wait for user message
    await waitFor(() => {
      expect(screen.getByTestId('message-test-uuid-0')).toHaveTextContent('Focus test (user)');
    });

    // Advance timers for AI response
    jest.advanceTimersByTime(2000);

    // Wait for AI message and then check focus
    await waitFor(() => {
      expect(screen.getByTestId('message-test-uuid-1')).toHaveTextContent('AI Echo: "Focus test" (ai)');
      expect(textarea).toHaveFocus();
    });
  });
});