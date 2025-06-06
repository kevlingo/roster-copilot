'use client'; // For Next.js App Router, if using hooks like useState

import React, { useState, useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import ChatBubbleOverlay from './ChatBubbleOverlay';
import { MessageObject } from '../../types/chat';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { setGlobalNotificationHandler, createAINotificationMessage } from '../../hooks/useAINotification';
import { ConversationManager } from '../../lib/conversation/conversation-manager';
import { useAuthStore } from '@/lib/store/auth.store';

const PersistentChatInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<MessageObject[]>([]);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const { user, token } = useAuthStore();
  const [conversationManager] = useState(() => new ConversationManager(undefined, user?.username));
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

  // Function to persist archetype selection to backend
  const persistArchetype = async (selectedArchetype: string): Promise<boolean> => {
    if (!token) {
      console.error('No auth token available');
      return false;
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ selectedArchetype }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Archetype updated successfully:', data);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to update archetype:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error updating archetype:', error);
      return false;
    }
  };

  // Handle component actions (like archetype selection)
  const handleComponentAction = async (action: string, data: unknown) => {
    if (action === 'archetype-selected' && typeof data === 'string') {
      // Process archetype selection
      const response = conversationManager.processUserInput(data);

      // Create AI response message
      const aiMessage: MessageObject = {
        id: uuidv4(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        type: response.messageType || 'conversation',
        componentType: response.componentType,
        componentProps: response.componentProps,
      };

      setChatHistory((prevHistory) => [...prevHistory, aiMessage]);

      // Handle archetype persistence if needed
      if (response.shouldPersistArchetype && conversationManager.getState().selectedArchetype) {
        const success = await persistArchetype(conversationManager.getState().selectedArchetype!);
        if (!success) {
          // Add error message
          const errorMessage: MessageObject = {
            id: uuidv4(),
            text: 'I had trouble saving your selection. Let me try again...',
            sender: 'ai',
            timestamp: new Date(),
            type: 'conversation',
          };
          setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
        }
      }

      // Check if onboarding is complete
      if (conversationManager.isComplete()) {
        setIsOnboardingMode(false);
      }
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

    // Add realistic delay for AI response
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000)); // 1-2 seconds delay

    let aiResponse: MessageObject;

    if (isOnboardingMode) {
      // Use conversation manager for onboarding
      const response = conversationManager.processUserInput(textToSend);

      aiResponse = {
        id: uuidv4(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        type: response.messageType || 'conversation',
        componentType: response.componentType,
        componentProps: response.componentProps,
      };

      // Handle archetype persistence if needed
      if (response.shouldPersistArchetype && conversationManager.getState().selectedArchetype) {
        const success = await persistArchetype(conversationManager.getState().selectedArchetype!);
        if (!success) {
          aiResponse.text = 'I had trouble saving your selection. Let me try again...';
          aiResponse.type = 'conversation';
          delete aiResponse.componentType;
          delete aiResponse.componentProps;
        }
      }

      // Check if onboarding is complete
      if (conversationManager.isComplete()) {
        setIsOnboardingMode(false);
      }
    } else {
      // Regular chat mode - simple echo for now
      aiResponse = {
        id: uuidv4(),
        text: `AI Echo: "${textToSend}"`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'conversation',
      };
    }
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
  }, [addNotification]);

  // Check if user needs onboarding (no selected archetype)
  useEffect(() => {
    if (user && !user.selectedArchetype && chatHistory.length === 0) {
      setIsOnboardingMode(true);
      // Start onboarding conversation
      const response = conversationManager.processUserInput('');
      const aiMessage: MessageObject = {
        id: uuidv4(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        type: response.messageType || 'conversation',
        componentType: response.componentType,
        componentProps: response.componentProps,
      };
      setChatHistory([aiMessage]);
    }
  }, [user, chatHistory.length, conversationManager]);

  return (
    // AC12: z-index and pointer events for main container
    <div className="fixed inset-0 flex flex-col pointer-events-none z-50">
      <ChatBubbleOverlay
        messages={chatHistory}
        isVisible={isOverlayVisible}
        onComponentAction={handleComponentAction}
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