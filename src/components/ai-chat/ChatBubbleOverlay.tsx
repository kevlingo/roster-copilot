import React, { useLayoutEffect, useRef } from 'react';
import { MessageObject } from '../../types/chat';
import ChatMessageBubble from './ChatMessageBubble';

interface ChatBubbleOverlayProps {
  messages: MessageObject[];
  isVisible: boolean;
  onComponentAction?: (action: string, data: unknown) => void;
}

const ChatBubbleOverlay: React.FC<ChatBubbleOverlayProps> = ({
  messages,
  isVisible,
  onComponentAction,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isVisible && messages.length > 0) {
      // Get the last message (most recent AI response)
      const lastMessage = messages[messages.length - 1];

      // Only scroll to top of the new AI message when it's added
      if (lastMessage.sender === 'ai') {
        // Find the last message element and scroll it to the top of the visible area
        const messageElements = messagesContainerRef.current?.querySelectorAll('[data-message-id]');
        const lastMessageElement = messageElements?.[messageElements.length - 1] as HTMLElement;

        if (lastMessageElement && messagesContainerRef.current) {
          // Scroll so the top of the new AI message is visible
          const containerRect = messagesContainerRef.current.getBoundingClientRect();
          const messageRect = lastMessageElement.getBoundingClientRect();
          const scrollOffset = messageRect.top - containerRect.top;

          messagesContainerRef.current.scrollTop += scrollOffset;
        }
      }
    }
  }, [messages, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-16 right-4 p-4 flex flex-col items-end pointer-events-none"
    >
      <div
        ref={messagesContainerRef}
        className="messages-list w-96 overflow-y-auto pointer-events-auto max-h-96 flex flex-col space-y-2 pr-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
        tabIndex={0}
      >
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            onComponentAction={onComponentAction}
          />
        ))}
        <div ref={messagesEndRef} data-testid="messages-end-sentinel" />
      </div>
    </div>
  );
};

export default ChatBubbleOverlay;