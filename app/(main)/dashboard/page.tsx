'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InsightCard from '@/src/components/copilot/InsightCard';

// Mock data
const mockLeagues = [
  { id: 'league-123', name: 'Fantasy Ballers', record: '3-2', standing: 4 },
  { id: 'league-456', name: 'Office League', record: '4-1', standing: 2 },
];

const mockInsights = [
  {
    id: 'insight-1',
    title: 'Start Cooper Kupp this week',
    description: 'Kupp has a favorable matchup against the Packers secondary that ranks 28th against WRs.',
    category: 'lineup' as const,
    actionLabel: 'View Lineup',
    actionPath: '/league/league-123/lineup',
  },
  {
    id: 'insight-2',
    title: 'Target RB Austin Ekeler on waivers',
    description: 'Ekeler is returning from injury and is available in your league. He could provide RB1 value.',
    category: 'waiver' as const,
    actionLabel: 'View Waivers',
    actionPath: '/league/league-123/waivers',
  },
  {
    id: 'insight-3',
    title: 'ALERT: QB Dak Prescott questionable',
    description: 'Prescott is listed as questionable for Sunday. Have a backup plan ready.',
    category: 'alert' as const,
    actionLabel: 'Check Alternatives',
    actionPath: '/league/league-123/lineup',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="loading-pulse h-32"></div>
          <div className="loading-pulse h-32"></div>
        </div>
        
        <h2 className="section-title">AI Copilot Insights</h2>
        <div className="space-y-3">
          <div className="loading-pulse h-24"></div>
          <div className="loading-pulse h-24"></div>
          <div className="loading-pulse h-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/league/join"
            className="btn btn-outline"
          >
            Join League
          </Link>
          <Link
            href="/league/create"
            className="btn btn-primary"
          >
            + Create League
          </Link>
        </div>
      </div>

      {/* League Cards */}
      <div>
        <h2 className="section-title mb-4">My Leagues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockLeagues.map((league) => (
          <div 
            key={league.id}
            className="card bg-base-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="card-body">
              <h2 className="card-title">{league.name}</h2>
              <div className="flex justify-between items-center">
                <p>Record: <span className="font-medium">{league.record}</span></p>
                <p>Standing: <span className="font-medium">{league.standing}</span></p>
              </div>
              <div className="card-actions justify-end mt-2">
                <Link 
                  href={`/league/${league.id}/roster`}
                  className="btn btn-primary btn-sm"
                >
                  View Team
                </Link>
                <Link 
                  href={`/draft/${league.id}`}
                  className="btn btn-outline btn-sm"
                >
                  Draft Room
                </Link>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
      
      {/* AI Copilot Insights */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="section-title">AI Copilot Insights</h2>
          <Link 
            href="/copilot/digest"
            className="btn btn-sm btn-outline"
          >
            View All
          </Link>
        </div>
        
        <div className="space-y-3">
          {mockInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              title={insight.title}
              description={insight.description}
              category={insight.category}
              actionLabel={insight.actionLabel}
              onAction={() => router.push(insight.actionPath)}
              onThumbsUp={() => console.log('Thumbs up for', insight.id)}
              onThumbsDown={() => console.log('Thumbs down for', insight.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}