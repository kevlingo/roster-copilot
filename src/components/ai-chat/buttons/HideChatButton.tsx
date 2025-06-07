'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface HideChatButtonProps {
  onClick: () => void;
  isChatVisible: boolean;
  // Future props like custom classNames can be added here
}

const HideChatButton: React.FC<HideChatButtonProps> = ({ onClick, isChatVisible }) => {
  const label = isChatVisible ? "Hide chat history" : "Show chat history";

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      aria-label={label}
      title={label}
      aria-pressed={isChatVisible}
    >
      {isChatVisible ? <EyeOff className="h-6 w-6" aria-hidden="true" /> : <Eye className="h-6 w-6" aria-hidden="true" />}
    </button>
  );
};

export default HideChatButton;