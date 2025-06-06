import { useCallback } from 'react';
import { MessageObject } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

// Context for AI notification system
interface AINotificationContextType {
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Global notification handler - will be set by PersistentChatInterface
let globalNotificationHandler: AINotificationContextType['addNotification'] | null = null;

export const setGlobalNotificationHandler = (handler: AINotificationContextType['addNotification']) => {
  globalNotificationHandler = handler;
};

export const useAINotification = () => {
  const showSuccess = useCallback((message: string) => {
    if (globalNotificationHandler) {
      globalNotificationHandler(message, 'success');
    } else {
      console.warn('AI notification handler not available, falling back to console:', message);
    }
  }, []);

  const showError = useCallback((message: string) => {
    if (globalNotificationHandler) {
      globalNotificationHandler(message, 'error');
    } else {
      console.warn('AI notification handler not available, falling back to console:', message);
    }
  }, []);

  const showInfo = useCallback((message: string) => {
    if (globalNotificationHandler) {
      globalNotificationHandler(message, 'info');
    } else {
      console.warn('AI notification handler not available, falling back to console:', message);
    }
  }, []);

  return {
    showSuccess,
    showError,
    showInfo,
  };
};

// Helper function to create AI notification messages
export const createAINotificationMessage = (
  message: string, 
  type: 'success' | 'error' | 'info'
): MessageObject => {
  const aiPersonalityMessages = {
    success: [
      `Great news! ${message} 🎉`,
      `Excellent! ${message} ✨`,
      `Perfect! ${message} 👍`,
      `Wonderful! ${message} 🌟`,
    ],
    error: [
      `Oops! ${message} I'm here to help if you need assistance.`,
      `Hmm, ${message} Let me know if you'd like me to help troubleshoot.`,
      `Oh no! ${message} Don't worry, we can work through this together.`,
      `I noticed ${message} Feel free to ask me for help with this.`,
    ],
    info: [
      `Just so you know: ${message}`,
      `Here's an update: ${message}`,
      `FYI: ${message}`,
      `Quick heads up: ${message}`,
    ],
  };

  const messages = aiPersonalityMessages[type];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return {
    id: uuidv4(),
    text: randomMessage,
    sender: 'ai',
    timestamp: new Date(),
    type: 'notification',
    notificationType: type,
  };
};
