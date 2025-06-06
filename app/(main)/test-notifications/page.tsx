'use client';

import React from 'react';
import { useAINotification } from '@/src/hooks/useAINotification';

export default function TestNotificationsPage() {
  const { showSuccess, showError, showInfo } = useAINotification();

  const handleSuccessTest = () => {
    showSuccess('Profile updated successfully!');
  };

  const handleErrorTest = () => {
    showError('Failed to save changes. Please try again.');
  };

  const handleInfoTest = () => {
    showInfo('System maintenance scheduled for tonight at 2 AM.');
  };

  return (
    <div className="page-container space-y-6">
      <h1 className="page-title">AI Notification System Test</h1>
      
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Test AI Notifications</h2>
          <p className="text-base-content/70 mb-4">
            Click the buttons below to test different types of AI notifications. 
            The AI agent will deliver these messages instead of showing traditional toaster notifications.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              className="btn btn-success"
              onClick={handleSuccessTest}
            >
              Test Success Notification
            </button>
            
            <button 
              className="btn btn-error"
              onClick={handleErrorTest}
            >
              Test Error Notification
            </button>
            
            <button 
              className="btn btn-info"
              onClick={handleInfoTest}
            >
              Test Info Notification
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-base-200 rounded-lg">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Success notifications appear with green styling and celebratory messages</li>
              <li>Error notifications appear with red styling and helpful AI responses</li>
              <li>Info notifications appear with blue styling and conversational updates</li>
              <li>All notifications are delivered through the AI chat interface</li>
              <li>The AI agent automatically shows when notifications arrive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
