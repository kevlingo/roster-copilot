'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    // Basic validation
    if (!username || !email || !password) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setFormError(null);
    
    try {
      // TODO: Call API to /api/auth/signup with { username, email, password }
      // For the PoC, we'll simulate a successful signup after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to onboarding
      router.push('/onboarding');
    } catch (error) {
      console.error('Signup failed:', error);
      setFormError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Create Account</h2>
      
      {formError && (
        <div className="alert alert-error text-sm">{formError}</div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Username</span>
          </label>
          <input 
            type="text" 
            name="username"
            placeholder="fantasy_champion" 
            className="input input-bordered w-full" 
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input 
            type="email" 
            name="email"
            placeholder="your@email.com" 
            className="input input-bordered w-full" 
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input 
            type="password" 
            name="password"
            placeholder="••••••••" 
            className="input input-bordered w-full" 
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Confirm Password</span>
          </label>
          <input 
            type="password" 
            name="confirmPassword"
            placeholder="••••••••" 
            className="input input-bordered w-full" 
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label cursor-pointer">
            <input type="checkbox" className="checkbox checkbox-sm" required />
            <span className="label-text ml-2">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </span>
          </label>
        </div>
        
        <button 
          type="submit" 
          className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="text-center">
        <p className="text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}