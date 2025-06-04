import React, { useLayoutEffect, useRef } from 'react';
import { MessageObject } from '../../types/chat';
import ChatMessageBubble from './ChatMessageBubble';

interface ChatBubbleOverlayProps {
  messages: MessageObject[];
  isVisible: boolean;
}

const ChatBubbleOverlay: React.FC<ChatBubbleOverlayProps> = ({
  messages,
  isVisible,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isVisible && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
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
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} data-testid="messages-end-sentinel" />
      </div>
    </div>
  );
};

export default ChatBubbleOverlay;