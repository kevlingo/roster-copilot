import React from 'react';
import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-base-100 rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-primary text-primary-content">
              <Brain size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Roster Copilot</h1>
          <p className="text-sm text-base-content/70">Your AI Fantasy Football Companion</p>
        </div>
        
        {children}
      </div>
      
      <footer className="mt-8 text-center text-sm text-base-content/70">
        <p>Hackathon PoC &copy; 2025</p>
      </footer>
    </div>
  );
}