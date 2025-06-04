'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CreateLeagueForm {
  leagueName: string;
  numberOfTeams: 8 | 10 | 12;
  scoringType: 'Standard' | 'PPR';
}

interface ApiError {
  error: string;
}

export default function CreateLeaguePage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateLeagueForm>({
    leagueName: '',
    numberOfTeams: 10,
    scoringType: 'PPR'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'numberOfTeams' ? parseInt(value) as 8 | 10 | 12 : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): string | null => {
    if (!form.leagueName.trim()) {
      return 'League name is required';
    }
    if (form.leagueName.trim().length < 3) {
      return 'League name must be at least 3 characters long';
    }
    if (form.leagueName.trim().length > 50) {
      return 'League name must be 50 characters or less';
    }
    if (![8, 10, 12].includes(form.numberOfTeams)) {
      return 'Number of teams must be 8, 10, or 12';
    }
    if (!['Standard', 'PPR'].includes(form.scoringType)) {
      return 'Scoring type must be Standard or PPR';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leagueName: form.leagueName.trim(),
          numberOfTeams: form.numberOfTeams,
          scoringType: form.scoringType
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'Failed to create league');
      }

      const newLeague = await response.json();
      setSuccess('League created successfully! Redirecting...');
      
      // Redirect to the new league's dashboard after a short delay
      setTimeout(() => {
        router.push(`/league/${newLeague.leagueId}/roster`);
      }, 1500);

    } catch (err) {
      console.error('Error creating league:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="page-title">Create New League</h1>
          <Link 
            href="/dashboard" 
            className="btn btn-ghost btn-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Form Card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* League Name */}
              <div className="form-control">
                <label htmlFor="leagueName" className="label">
                  <span className="label-text font-medium">League Name *</span>
                </label>
                <input
                  type="text"
                  id="leagueName"
                  name="leagueName"
                  value={form.leagueName}
                  onChange={handleInputChange}
                  placeholder="Enter your league name"
                  className="input input-bordered w-full"
                  maxLength={50}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    {form.leagueName.length}/50 characters
                  </span>
                </label>
              </div>

              {/* Number of Teams */}
              <div className="form-control">
                <label htmlFor="numberOfTeams" className="label">
                  <span className="label-text font-medium">Number of Teams *</span>
                </label>
                <select
                  id="numberOfTeams"
                  name="numberOfTeams"
                  value={form.numberOfTeams}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value={8}>8 Teams</option>
                  <option value={10}>10 Teams</option>
                  <option value={12}>12 Teams</option>
                </select>
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Choose how many teams will be in your league
                  </span>
                </label>
              </div>

              {/* Scoring Type */}
              <div className="form-control">
                <label htmlFor="scoringType" className="label">
                  <span className="label-text font-medium">Scoring Type *</span>
                </label>
                <select
                  id="scoringType"
                  name="scoringType"
                  value={form.scoringType}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="Standard">Standard</option>
                  <option value="PPR">PPR (Point Per Reception)</option>
                </select>
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    PPR gives 1 point for each reception, Standard does not
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="form-control">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                >
                  {isSubmitting ? 'Creating League...' : 'Create League'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-semibold text-lg">What happens next?</h3>
            <ul className="list-disc list-inside space-y-1 text-sm opacity-80">
              <li>You&apos;ll be the commissioner of this league</li>
              <li>The draft will be scheduled (status: &quot;Scheduled&quot;)</li>
              <li>You can invite other users to join your league</li>
              <li>Default roster settings will be applied (QB:1, RB:2, WR:2, TE:1, K:1, DEF:1, BENCH:6)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
