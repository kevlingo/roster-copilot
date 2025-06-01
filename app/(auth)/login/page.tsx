'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Basic validation
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setFormError(null);
    
    try {
      // TODO: Call API to /api/auth/login with { email, password }
      // For the PoC, we'll simulate a successful login after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard or onboarding based on user status
      // For the PoC, let's assume all users need to complete onboarding
      router.push('/onboarding');
    } catch (error) {
      console.error('Login failed:', error);
      setFormError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Log In</h2>
      
      {formError && (
        <div className="alert alert-error text-sm">{formError}</div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
        
        <div className="flex justify-between items-center">
          <div className="form-control">
            <label className="label cursor-pointer">
              <input type="checkbox" className="checkbox checkbox-sm" />
              <span className="label-text ml-2">Remember me</span>
            </label>
          </div>
          
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        
        <button 
          type="submit" 
          className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <div className="text-center">
        <p className="text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}