'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';

interface JoinLeagueResponse {
  message: string;
  league: {
    leagueId: string;
    leagueName: string;
    numberOfTeams: number;
    currentTeamCount: number;
  };
  team: {
    teamId: string;
    teamName: string;
    userId: string;
  };
}

interface ApiError {
  error: string;
}

export default function JoinLeaguePage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [leagueId, setLeagueId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication
    if (!token) {
      setError('You must be logged in to join a league');
      return;
    }

    // Basic client-side validation
    if (!leagueId.trim()) {
      setError('Please enter a League ID');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/leagues/${leagueId.trim()}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'Failed to join league');
      }

      const data: JoinLeagueResponse = await response.json();
      setSuccess(`Successfully joined "${data.league.leagueName}"! Redirecting to your team...`);
      
      // Redirect to the league's roster page after a short delay
      setTimeout(() => {
        router.push(`/league/${data.league.leagueId}/roster`);
      }, 2000);

    } catch (error) {
      console.error('Join league failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to join league. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="page-title">Join League</h1>
        <p className="text-base-content/70 mt-2">
          Enter the League ID to join an existing fantasy football league
        </p>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">League ID</span>
              </label>
              <input
                type="text"
                placeholder="Enter League ID"
                className="input input-bordered w-full"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                disabled={isSubmitting}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Ask your league commissioner for the League ID
                </span>
              </label>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining League...' : 'Join League'}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <Link 
              href="/league/create"
              className="btn btn-outline btn-sm"
            >
              Create New League
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link 
          href="/dashboard"
          className="btn btn-ghost btn-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
