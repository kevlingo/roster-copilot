'use client';

import React, { useState } from 'react';
import { Settings } from 'lucide-react'; // Changed from CogIcon

interface ChatSettingsProps {
  onClearHistory: () => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ onClearHistory }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleClearHistory = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear the chat history? This cannot be undone."
    );
    if (confirmClear) {
      onClearHistory();
    }
    setIsPopoverOpen(false); // Close popover regardless of confirmation
  };

  return (
    <div className="relative">
      <button
        id="chat-settings-button"
        onClick={togglePopover}
        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        aria-label="Chat settings"
        aria-expanded={isPopoverOpen}
        aria-haspopup="true"
      >
        <Settings size={20} /> {/* Changed from CogIcon and adjusted size for consistency */}
      </button>
      {isPopoverOpen && (
        <div
          className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="chat-settings-button"
        >
          <button
            onClick={handleClearHistory}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 rounded-md"
            role="menuitem"
          >
            Clear Chat History
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatSettings;