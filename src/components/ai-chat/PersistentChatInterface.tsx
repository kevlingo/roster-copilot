'use client'; // For Next.js App Router, if using hooks like useState

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatInput from './ChatInput';
import ChatBubbleOverlay from './ChatBubbleOverlay';
import { MessageObject } from '../../types/chat';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { setGlobalNotificationHandler, createAINotificationMessage } from '../../hooks/useAINotification';
import { ConversationManager } from '../../lib/conversation/conversation-manager';
import { useAuthStore } from '@/lib/store/auth.store';
import { chatHistoryService } from '@/lib/services/chat-history.service';

const PersistentChatInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<MessageObject[]>([]);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);
  const [, setIsLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const { user, token } = useAuthStore();
  const [conversationManager] = useState(() => new ConversationManager(undefined, user?.username));
  // const chatOverlayRef = useRef<HTMLDivElement>(null); // Removed as it's not currently used


  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  // Handler for AI notifications
  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const notificationMessage = createAINotificationMessage(message, type);
    setChatHistory((prevHistory) => [...prevHistory, notificationMessage]);

    // Ensure overlay is visible when notification arrives
    if (!isOverlayVisible) {
      setIsOverlayVisible(true);
    }
  }, [isOverlayVisible]);

  // Load chat history from backend
  const loadChatHistory = useCallback(async () => {
    if (!user || !token || historyLoaded) return;

    setIsLoadingHistory(true);
    try {
      // Set up the chat history service with auth token
      chatHistoryService.setAuthToken(token);

      // Load conversation history
      const { messages } = await chatHistoryService.loadConversationHistory({
        limit: 50, // Load last 50 messages
        conversationType: isOnboardingMode ? 'onboarding' : 'general',
      });

      // Only set history if we don't have any messages yet
      if (chatHistory.length === 0 && messages.length > 0) {
        setChatHistory(messages.reverse()); // Reverse to show oldest first
      }

      setHistoryLoaded(true);
    } catch (error) {
      console.error('[PersistentChatInterface] Error loading chat history:', error);
      // Don't show error to user, just continue with empty history
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, token, historyLoaded, chatHistory.length, isOnboardingMode]);

  // Persist a message to backend
  const persistMessage = useCallback(async (message: MessageObject) => {
    if (!user || !token) return;

    try {
      // Set up the chat history service with auth token
      chatHistoryService.setAuthToken(token);

      // Get conversation context for onboarding messages
      const conversationContext = isOnboardingMode ? conversationManager.getState() : undefined;

      // Persist the message
      await chatHistoryService.persistMessage(message, conversationContext);
    } catch (error) {
      console.error('[PersistentChatInterface] Error persisting message:', error);
      // Don't show error to user, message is still in UI
    }
  }, [user, token, isOnboardingMode, conversationManager]);

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

      // Persist AI message to backend
      persistMessage(aiMessage);

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
          // Persist error message to backend
          persistMessage(errorMessage);
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

    // Persist user message to backend
    persistMessage(userMessage);

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

    // Persist AI response to backend
    persistMessage(aiResponse);

    setIsLoadingResponse(false);
    // Focus will be handled by the new useEffect below
  };

  // AC8: Handler for toggling overlay visibility
  const toggleOverlayVisibility = () => {
    setIsOverlayVisible(prev => !prev);
  };

  // AC9: Handler for clearing chat history (UI only - backend data preserved)
  const clearChatHistory = () => {
    // Optional: Add confirmation dialog here
    setChatHistory([]);

    // Call the service's clearUIHistory method for consistency
    chatHistoryService.clearUIHistory();

    // Reset history loaded flag so it can be reloaded if needed
    setHistoryLoaded(false);
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

  // Load chat history when user is authenticated
  useEffect(() => {
    if (user && token && !historyLoaded) {
      loadChatHistory();
    }
  }, [user, token, historyLoaded, loadChatHistory]);

  // Check if user needs onboarding (no selected archetype)
  useEffect(() => {
    if (user && !user.selectedArchetype && chatHistory.length === 0 && historyLoaded) {
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
      // Persist the initial onboarding message
      persistMessage(aiMessage);
    }
  }, [user, chatHistory.length, conversationManager, historyLoaded, persistMessage]);

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