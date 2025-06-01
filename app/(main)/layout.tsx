'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/src/components/core/Sidebar';
import Header from '@/src/components/core/Header';
import AIPanel from '@/src/components/ai-copilot/AIPanel';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isAIPanelMinimized, setIsAIPanelMinimized] = useState(false);
  
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
  
  // Special handling for onboarding page - AI Panel should be open by default
  useEffect(() => {
    if (pathname === '/onboarding') {
      setIsAIPanelOpen(true);
      setIsAIPanelMinimized(false);
    }
  }, [pathname]);

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
      
      {/* AI Copilot Panel */}
      <AIPanel
        isOpen={isAIPanelOpen}
        onToggleOpen={() => setIsAIPanelOpen(!isAIPanelOpen)}
        isMinimized={isAIPanelMinimized}
        onToggleMinimize={() => setIsAIPanelMinimized(!isAIPanelMinimized)}
        title={pathname === '/onboarding' ? 'AI Copilot Onboarding' : 'AI Copilot'}
      >
        {pathname === '/onboarding' ? (
          <div className="text-center space-y-4">
            <h3 className="font-bold text-lg">Welcome to Roster Copilot!</h3>
            <p>I'm your AI fantasy football assistant. Let's get to know each other better.</p>
            <p>First, let's figure out what kind of fantasy manager you are...</p>
            {/* Onboarding content would go here - see onboarding page for full implementation */}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-medium">How can I help with your fantasy team today?</p>
            <div className="bg-base-200 rounded-lg p-3">
              <p className="text-sm font-medium">Suggestion</p>
              <p className="text-sm text-base-content/80">Check your waiver wire options for week 5.</p>
            </div>
            <div className="bg-base-200 rounded-lg p-3">
              <p className="text-sm font-medium">Suggestion</p>
              <p className="text-sm text-base-content/80">Review your matchup analysis.</p>
            </div>
            <div className="bg-base-200 rounded-lg p-3">
              <p className="text-sm font-medium">Suggestion</p>
              <p className="text-sm text-base-content/80">Optimize your starting lineup.</p>
            </div>
          </div>
        )}
      </AIPanel>
      
      {/* AI Copilot floating button (visible when panel is closed) */}
      {!isAIPanelOpen && (
        <button 
          onClick={() => setIsAIPanelOpen(true)}
          className="fixed bottom-4 right-4 z-30 btn btn-primary btn-circle shadow-lg"
          aria-label="Open AI Copilot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
      )}
    </div>
  );
}