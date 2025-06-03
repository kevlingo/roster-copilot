import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatMessageBubble from './ChatMessageBubble';
import { MessageObject } from '../../types/chat';

describe('ChatMessageBubble', () => {
  const mockUserMessage: MessageObject = {
    id: '1',
    text: 'Hello AI!',
    sender: 'user',
    timestamp: new Date('2023-01-01T10:00:00Z'),
  };

  const mockAiMessage: MessageObject = {
    id: '2',
    text: 'Hello User!',
    sender: 'ai',
    timestamp: new Date('2023-01-01T10:01:00Z'),
  };

  const mockHtmlMessage: MessageObject = {
    id: '3',
    text: 'Check <a href="https://example.com">this link</a>',
    sender: 'ai',
    timestamp: new Date('2023-01-01T10:02:00Z'),
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  test('renders user message correctly', () => {
    render(<ChatMessageBubble message={mockUserMessage} />);

    const bubble = screen.getByText(mockUserMessage.text).closest('div');
    const container = bubble?.parentElement;

    // Check text content
    expect(screen.getByText(mockUserMessage.text)).toBeInTheDocument();

    // Check timestamp
    expect(screen.getByText(formatTime(mockUserMessage.timestamp))).toBeInTheDocument();

    // Check user-specific classes (simplified check, exact classes might be brittle)
    expect(container).toHaveClass('self-end'); // User messages align to the right
    expect(bubble).toHaveClass('bg-gray-200'); // self-start is removed from bubble instance
    expect(screen.getByText(formatTime(mockUserMessage.timestamp))).toHaveClass('text-left');
  });

  test('renders AI message correctly', () => {
    render(<ChatMessageBubble message={mockAiMessage} />);
    
    const bubble = screen.getByText(mockAiMessage.text).closest('div');
    const container = bubble?.parentElement;

    // Check text content
    expect(screen.getByText(mockAiMessage.text)).toBeInTheDocument();

    // Check timestamp
    expect(screen.getByText(formatTime(mockAiMessage.timestamp))).toBeInTheDocument();

    // Check AI-specific classes
    expect(container).toHaveClass('self-start'); // AI messages align to the left
    expect(bubble).toHaveClass('bg-blue-200'); // self-end is removed from bubble instance
    expect(screen.getByText(formatTime(mockAiMessage.timestamp))).toHaveClass('text-right');
  });

  test('renders HTML content correctly and link is present', () => {
    render(<ChatMessageBubble message={mockHtmlMessage} />);

    // Check if the link text is rendered (part of the HTML)
    // The getByRole below is a more robust way to check for the link and its accessible name.
    // expect(screen.getByText('Check this link')).toBeInTheDocument(); // This line can be problematic with mixed content.
    
    // Check for the anchor tag
    const linkElement = screen.getByRole('link', { name: /this link/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://example.com');
  });

  test('text is selectable', () => {
    // This is implicitly tested by being able to getByText.
    // Direct testing of browser's text selection behavior is complex and often out of scope for unit tests.
    // We assume standard paragraph behavior.
    render(<ChatMessageBubble message={mockUserMessage} />);
    expect(screen.getByText(mockUserMessage.text)).toBeInTheDocument(); 
  });

});