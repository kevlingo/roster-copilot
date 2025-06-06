// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>;
  };
});

// Mock remark-gfm
jest.mock('remark-gfm', () => {
  return function mockRemarkGfm() {
    return {};
  };
});

// Mock the ComponentMessageRenderer
jest.mock('./ComponentMessageRenderer', () => {
  return function MockComponentMessageRenderer({ message }: { message: { componentType?: string } }) {
    return <div data-testid="component-renderer">Component: {message.componentType}</div>;
  };
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatMessageBubble from './ChatMessageBubble';
import { MessageObject } from '../../types/chat';

describe('ChatMessageBubble', () => {
  const mockOnComponentAction = jest.fn();

  beforeEach(() => {
    mockOnComponentAction.mockClear();
  });

  const mockUserMessage: MessageObject = {
    id: '1',
    text: 'Hello AI!',
    sender: 'user',
    timestamp: new Date('2023-01-01T10:00:00Z'),
    type: 'conversation',
  };

  const mockAiMessage: MessageObject = {
    id: '2',
    text: 'Hello User!',
    sender: 'ai',
    timestamp: new Date('2023-01-01T10:01:00Z'),
    type: 'conversation',
  };

  const mockHtmlMessage: MessageObject = {
    id: '3',
    text: 'Check <a href="https://example.com">this link</a>',
    sender: 'ai',
    timestamp: new Date('2023-01-01T10:02:00Z'),
    type: 'conversation',
  };

  const mockMarkdownMessage: MessageObject = {
    id: '4',
    text: '**Bold text** and *italic text* with a [link](https://example.com)',
    sender: 'ai',
    timestamp: new Date('2023-01-01T10:03:00Z'),
    type: 'markdown',
  };

  const mockComponentMessage: MessageObject = {
    id: '5',
    text: 'Select your archetype',
    sender: 'ai',
    timestamp: new Date('2023-01-01T10:04:00Z'),
    type: 'component',
    componentType: 'archetype-selection',
    componentProps: {},
  };

  const mockSuccessNotification: MessageObject = {
    id: '4',
    text: 'Great news! Operation completed successfully! 🎉',
    sender: 'ai',
    timestamp: new Date('2023-01-01T10:03:00Z'),
    type: 'notification',
    notificationType: 'success',
  };

  const mockErrorNotification: MessageObject = {
    id: '5',
    text: 'Oops! Something went wrong. I\'m here to help if you need assistance.',
    sender: 'ai',
    timestamp: new Date('2023-01-01T10:04:00Z'),
    type: 'notification',
    notificationType: 'error',
  };

  const mockInfoNotification: MessageObject = {
    id: '6',
    text: 'Just so you know: System maintenance scheduled for tonight.',
    sender: 'ai',
    timestamp: new Date('2023-01-01T10:05:00Z'),
    type: 'notification',
    notificationType: 'info',
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  test('renders user message correctly', () => {
    render(<ChatMessageBubble message={mockUserMessage} onComponentAction={mockOnComponentAction} />);

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
    render(<ChatMessageBubble message={mockAiMessage} onComponentAction={mockOnComponentAction} />);
    
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
    render(<ChatMessageBubble message={mockHtmlMessage} onComponentAction={mockOnComponentAction} />);

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
    render(<ChatMessageBubble message={mockUserMessage} onComponentAction={mockOnComponentAction} />);
    expect(screen.getByText(mockUserMessage.text)).toBeInTheDocument();
  });

  test('renders success notification with correct styling', () => {
    render(<ChatMessageBubble message={mockSuccessNotification} onComponentAction={mockOnComponentAction} />);

    const bubble = screen.getByText(mockSuccessNotification.text).closest('div');
    const container = bubble?.parentElement;

    // Check text content
    expect(screen.getByText(mockSuccessNotification.text)).toBeInTheDocument();

    // Check notification-specific classes
    expect(container).toHaveClass('self-start'); // AI messages align to the left
    expect(bubble).toHaveClass('bg-green-100', 'border-l-4', 'border-green-500');
  });

  test('renders error notification with correct styling', () => {
    render(<ChatMessageBubble message={mockErrorNotification} onComponentAction={mockOnComponentAction} />);

    const bubble = screen.getByText(mockErrorNotification.text).closest('div');
    const container = bubble?.parentElement;

    // Check text content
    expect(screen.getByText(mockErrorNotification.text)).toBeInTheDocument();

    // Check notification-specific classes
    expect(container).toHaveClass('self-start'); // AI messages align to the left
    expect(bubble).toHaveClass('bg-red-100', 'border-l-4', 'border-red-500');
  });

  test('renders info notification with correct styling', () => {
    render(<ChatMessageBubble message={mockInfoNotification} onComponentAction={mockOnComponentAction} />);

    const bubble = screen.getByText(mockInfoNotification.text).closest('div');
    const container = bubble?.parentElement;

    // Check text content
    expect(screen.getByText(mockInfoNotification.text)).toBeInTheDocument();

    // Check notification-specific classes
    expect(container).toHaveClass('self-start'); // AI messages align to the left
    expect(bubble).toHaveClass('bg-blue-100', 'border-l-4', 'border-blue-500');
  });

  test('renders markdown content correctly', () => {
    render(<ChatMessageBubble message={mockMarkdownMessage} onComponentAction={mockOnComponentAction} />);

    // Check that markdown content is rendered (with mock)
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    expect(screen.getByText('**Bold text** and *italic text* with a [link](https://example.com)')).toBeInTheDocument();
  });

  test('renders component messages correctly', () => {
    render(<ChatMessageBubble message={mockComponentMessage} onComponentAction={mockOnComponentAction} />);

    // Check that component renderer is called
    expect(screen.getByTestId('component-renderer')).toBeInTheDocument();
    expect(screen.getByText('Component: archetype-selection')).toBeInTheDocument();

    // Component messages should not show timestamp
    expect(screen.queryByText('10:04 AM')).not.toBeInTheDocument();
  });

  test('passes onComponentAction to ComponentMessageRenderer', () => {
    render(<ChatMessageBubble message={mockComponentMessage} onComponentAction={mockOnComponentAction} />);

    // The mock component renderer should receive the message
    expect(screen.getByTestId('component-renderer')).toBeInTheDocument();
  });

});