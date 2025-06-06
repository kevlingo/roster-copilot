'use client'; // For Next.js App Router, if using hooks like useState

import React, { useState, useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import ChatBubbleOverlay from './ChatBubbleOverlay';
import { MessageObject } from '../../types/chat';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { setGlobalNotificationHandler, createAINotificationMessage } from '../../hooks/useAINotification';

const PersistentChatInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<MessageObject[]>([]);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  // const chatOverlayRef = useRef<HTMLDivElement>(null); // Removed as it's not currently used


  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  // Handler for AI notifications
  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notificationMessage = createAINotificationMessage(message, type);
    setChatHistory((prevHistory) => [...prevHistory, notificationMessage]);

    // Ensure overlay is visible when notification arrives
    if (!isOverlayVisible) {
      setIsOverlayVisible(true);
    }
  };

  // AC7: handleSendMessage
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = typeof messageText === 'string' ? messageText : inputValue;
    if (textToSend.trim() === '') return;

    const userMessage: MessageObject = {
      id: uuidv4(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      type: 'conversation',
    };

    setChatHistory((prevHistory) => [...prevHistory, userMessage]);
    setInputValue('');

    // Ensure overlay is visible immediately after user sends a message
    if (!isOverlayVisible) {
      setIsOverlayVisible(true);
    }

    setIsLoadingResponse(true);

    // Simulate AI response (AC7)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000)); // 1-2 seconds delay

    const aiResponse: MessageObject = {
      id: uuidv4(),
      text: `AI Echo: "${textToSend}"`, // Simple echo for now
      sender: 'ai',
      timestamp: new Date(),
      type: 'conversation',
    };
    setChatHistory((prevHistory) => [...prevHistory, aiResponse]);
    setIsLoadingResponse(false);
    // Focus will be handled by the new useEffect below
  };

  // AC8: Handler for toggling overlay visibility
  const toggleOverlayVisibility = () => {
    setIsOverlayVisible(prev => !prev);
  };

  // AC9: Handler for clearing chat history
  const clearChatHistory = () => {
    // Optional: Add confirmation dialog here
    setChatHistory([]);
  };
  
  // AC11: Focus Management
  useEffect(() => {
    if (isOverlayVisible) {
        // Focus input when overlay becomes visible,
        // This could be modified to focus the last message or a specific control within the overlay
        chatInputRef.current?.focus();
    }
  }, [isOverlayVisible]);

  // Effect to focus input after AI response is received and input is enabled
  useEffect(() => {
    if (!isLoadingResponse && chatHistory.length > 0 && chatHistory[chatHistory.length -1].sender === 'ai') {
      chatInputRef.current?.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingResponse]); // Only re-run when isLoadingResponse changes

  // Set up global notification handler
  useEffect(() => {
    setGlobalNotificationHandler(addNotification);

    // Cleanup on unmount
    return () => {
      setGlobalNotificationHandler(() => {});
    };
  }, []);

  return (
    // AC12: z-index and pointer events for main container
    <div className="fixed inset-0 flex flex-col pointer-events-none z-50">
      <ChatBubbleOverlay
        messages={chatHistory}
        isVisible={isOverlayVisible}
        // onHideOverlay and onClearHistory removed from here
      />

      {/* Wrapper for ChatInput to re-enable pointer events */}
      <div className="mt-auto pointer-events-auto">
        <ChatInput
          ref={chatInputRef} // Pass ref for focus management
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSubmit={() => handleSendMessage()} // Ensure it calls with no args to use state's inputValue
          onHideOverlay={toggleOverlayVisibility} // Added prop
          onClearHistory={clearChatHistory} // Added prop
          isChatOverlayVisible={isOverlayVisible} // Pass the state here
          isDisabled={isLoadingResponse}
        />
      </div>
    </div>
  );
};

export default PersistentChatInterface;