import React from 'react';
import { MessageObject } from '../../types/chat'; // Corrected path

interface ChatMessageBubbleProps {
  message: MessageObject;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const { text, sender, timestamp, type, notificationType } = message;

  const isUser = sender === 'user';
  const isNotification = type === 'notification';

  // Define classes based on sender and message type
  let bubbleContainerClasses = ''; // Common container
  let bubbleInstanceClasses = 'rounded-lg shadow-sm p-3 max-w-2xl'; // Common bubble styles
  const textContentClasses = 'text-gray-800 text-sm leading-normal break-words'; // Common text styles
  const timestampClasses = 'text-xs text-gray-500 mt-1'; // Timestamp style

  if (isUser) {
    bubbleContainerClasses += ' self-end'; // User messages align to the right
    bubbleInstanceClasses += ' bg-gray-200'; // User bubble background
  } else { // AI messages
    bubbleContainerClasses += ' self-start'; // AI messages align to the left

    if (isNotification) {
      // Special styling for notification messages
      switch (notificationType) {
        case 'success':
          bubbleInstanceClasses += ' bg-green-100 border-l-4 border-green-500';
          break;
        case 'error':
          bubbleInstanceClasses += ' bg-red-100 border-l-4 border-red-500';
          break;
        case 'info':
          bubbleInstanceClasses += ' bg-blue-100 border-l-4 border-blue-500';
          break;
        default:
          bubbleInstanceClasses += ' bg-blue-200'; // Default AI background
      }
    } else {
      bubbleInstanceClasses += ' bg-blue-200'; // Regular AI conversation background
    }
  }

  const formattedTimestamp = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className={bubbleContainerClasses}>
      <div className={bubbleInstanceClasses}>
        {/* AC10: Links clickable (via dangerouslySetInnerHTML), AC11: Text selectable (default for p) */}
        <p
          className={textContentClasses}
          dangerouslySetInnerHTML={{ __html: text }}
        />
        {/* AC6: Render subtle timestamp */}
        <div className={`${timestampClasses} ${isUser ? 'text-left' : 'text-right'}`}>
          {formattedTimestamp}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;