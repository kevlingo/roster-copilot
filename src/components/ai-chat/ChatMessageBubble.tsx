import React from 'react';
import { MessageObject } from '../../types/chat'; // Corrected path

interface ChatMessageBubbleProps {
  message: MessageObject;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const { text, sender, timestamp } = message; // timestamp is part of MessageObject

  const isUser = sender === 'user';

  // Define classes based on sender
  // AC2: User messages: light grey (bg-gray-200), rounded (rounded-lg), shadow (shadow-sm)
  // AC3: AI messages: (Handled in Task 3)
  // AC4: User text alignment (left - default for <p> within a left-aligned bubble)
  // AC7: Padding (p-3), Margins (mb-2 for bottom margin between bubbles for the container)
  // AC8: Text color (text-gray-800)
  // AC9: Typography (text-sm, leading-normal)

  let bubbleContainerClasses = ''; // Common container. 'flex' REMOVED. w-full removed as self-end/start handles alignment. mb-2 REMOVED. Red border removed.
  let bubbleInstanceClasses = 'rounded-lg shadow-sm p-3 max-w-2xl'; // Common bubble styles: corners, shadow, padding, max width updated to max-w-2xl
  const textContentClasses = 'text-gray-800 text-sm leading-normal break-words'; // Common text styles, added break-words
  // AC6: Subtle timestamp style
  const timestampClasses = 'text-xs text-gray-500 mt-1'; // Smaller, greyed out, margin top

  if (isUser) {
    bubbleContainerClasses += ' self-end'; // User messages align to the right
    bubbleInstanceClasses += ' bg-gray-200'; // User bubble background
  } else { // AI messages
    bubbleContainerClasses += ' self-start'; // AI messages align to the left
    // Ensure AI text is also dark for contrast on blue, this was missed previously.
    // AI bubble bg-blue-200 is light enough that text-gray-800 should still be fine.
    bubbleInstanceClasses += ' bg-blue-200'; // AI bubble background
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