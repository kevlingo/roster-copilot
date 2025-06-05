'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';

// TODO: Import icons if needed (e.g., for input fields or button)
// For example: import { AlertTriangle, CheckCircle } from 'lucide-react';
// For example: import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const loginToStore = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    
    setError(null);

    // Subtask 2.4: Client-side validation
    
    if (!email.trim()) {
      
      setError('Email address is required.');
      setIsLoading(false); // Ensure loading is false if validation fails
      return;
    }
    
    if (!password.trim()) {
      
      setError('Password is required.');
      setIsLoading(false); // Ensure loading is false if validation fails
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.');
      } else {
        // Login successful
        
        loginToStore(data.user, data.token); // Subtask 2.6
        // Subtask 2.7: Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (networkError) {
      console.error('Login API call failed:', networkError);
      setError('Login failed due to a network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Login to your Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            <span className="label-text">Email Address</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
        />
        {error === 'Email address is required.' && (
          <p data-testid="email-error" className="text-error text-xs mt-1">{error}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">
            <span className="label-text">Password</span>
          </label>
          <div className="text-sm">
            {/* TODO: Subtask 2.9: Implement "Forgot Password?" link (pointing to Story 1.5 route) */}
            <Link href="/forgot-password" legacyBehavior>
              <a className="link link-primary hover:link-secondary">
                Forgot password?
              </a>
            </Link>
          </div>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        {error === 'Password is required.' && (
          <p data-testid="password-error" className="text-error text-xs mt-1">{error}</p>
        )}
      </div>

      {/* Display other errors (e.g., API errors) in a general alert */}
      {error && error !== 'Email address is required.' && error !== 'Password is required.' && (
        <div role="alert" className="alert alert-error text-sm" data-testid="login-error-alert">
          {/* TODO: Icon for error message */}
          <span>{error}</span>
        </div>
      )}

      <div>
        <button
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              'Login'
            )}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" legacyBehavior>
          <a className="link link-primary hover:link-secondary">
            Sign Up
          </a>
        </Link>
      </p>
    </div>
  );
}