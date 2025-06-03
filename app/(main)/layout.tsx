'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/src/components/core/Sidebar';
import Header from '@/src/components/core/Header';
import PersistentChatInterface from '@/src/components/ai-chat/PersistentChatInterface';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Current league ID (would come from state management in a real app)
  const currentLeagueId = 'league-123';
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  
  // Set initial theme based on user preference
  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);
  
  // Logout function
  const handleLogout = () => {
    // TODO: Call API to /api/auth/logout
    // For the PoC, we'll just redirect to login
    window.location.href = '/login';
  };
  

  return (
    <div className="flex h-screen">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar currentLeagueId={currentLeagueId} />
      </div>
      
      {/* Mobile drawer */}
      <div className="drawer md:hidden">
        <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* Page content */}
          <Header 
            username="Fantasy User"
            onLogout={handleLogout}
            onToggleTheme={toggleTheme}
            isDarkTheme={theme === 'dark'}
          />
          
          <main className="flex-1 overflow-y-auto bg-base-200 p-4">
            {children}
          </main>
        </div>
        
        {/* Drawer sidebar */}
        <div className="drawer-side z-40">
          <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
          <Sidebar currentLeagueId={currentLeagueId} />
        </div>
      </div>
      
      {/* Main content area - desktop */}
      <div className="hidden md:flex flex-1 flex-col">
        <Header 
          username="Fantasy User"
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
          isDarkTheme={theme === 'dark'}
        />
        
        <main className="flex-1 overflow-y-auto bg-base-200 p-4">
          {children}
        </main>
      </div>
      
      <PersistentChatInterface />
    </div>
  );
}