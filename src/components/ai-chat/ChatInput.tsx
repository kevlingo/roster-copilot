'use client';

import React, { forwardRef } from 'react';
import { SendHorizontal } from 'lucide-react'; // Removed X and Settings
import HideChatButton from './buttons/HideChatButton';
import ChatSettings from './ChatSettings';

export interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onHideOverlay: () => void;
  onClearHistory: () => void;
  isChatOverlayVisible: boolean; // Added to control HideChatButton state
  isDisabled?: boolean;
  placeholder?: string;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(({
  inputValue,
  onInputChange,
  onSubmit,
  onHideOverlay,
  onClearHistory,
  isChatOverlayVisible, // Added
  isDisabled = false,
  placeholder = "Type your message...",
}, ref) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isDisabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-transparent">
      <div className="w-full max-w-3xl lg:w-3/4 xl:w-2/3 flex items-end p-2 bg-gray-100 rounded-lg shadow-md border border-gray-300 transition-colors duration-150 ease-in-out focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <textarea
          ref={ref}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className="flex-grow p-2 text-sm bg-transparent border-none rounded-md resize-none focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-500"
          style={{ maxHeight: '100px', minHeight: '2.5rem', overflowY: 'auto' }} // Max height for 4-5 lines approx. minHeight for standard input.
        />
        <div className="flex items-center ml-2 space-x-1">
          <button
            onClick={onSubmit}
            disabled={isDisabled}
            className="p-2 rounded-md text-gray-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <SendHorizontal size={20} />
          </button>
          <HideChatButton onClick={onHideOverlay} isChatVisible={isChatOverlayVisible} />
          <ChatSettings onClearHistory={onClearHistory} />
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;