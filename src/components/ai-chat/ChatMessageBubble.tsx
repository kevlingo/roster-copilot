import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageObject } from '../../types/chat'; // Corrected path
import ComponentMessageRenderer from './ComponentMessageRenderer';

interface ChatMessageBubbleProps {
  message: MessageObject;
  onComponentAction?: (action: string, data: unknown) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onComponentAction }) => {
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

  // Render content based on message type
  const renderMessageContent = () => {
    if (type === 'component') {
      return (
        <ComponentMessageRenderer
          message={message}
          onComponentAction={onComponentAction}
        />
      );
    }

    if (type === 'markdown') {
      return (
        <div className={textContentClasses}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for markdown elements
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      );
    }

    // Default: HTML content (existing behavior)
    return (
      <p
        className={textContentClasses}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  };

  return (
    <div className={bubbleContainerClasses} data-message-id={message.id}>
      <div className={bubbleInstanceClasses}>
        {renderMessageContent()}
        {/* AC6: Render subtle timestamp - only for non-component messages */}
        {type !== 'component' && (
          <div className={`${timestampClasses} ${isUser ? 'text-left' : 'text-right'}`}>
            {formattedTimestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;