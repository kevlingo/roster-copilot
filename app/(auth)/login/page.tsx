'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';

// Define a type for the login form inputs
interface LoginInputs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  // For general API errors or success/info messages
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue, // To pre-fill email
    formState: { errors },
  } = useForm<LoginInputs>({ mode: 'onTouched' });

  useEffect(() => {
    const verified = searchParams.get('verified');
    const emailFromQuery = searchParams.get('email');

    if (verified === 'true') {
      setFormMessage({ type: 'success', message: 'Email verified successfully! Please log in.' });
    }
    if (emailFromQuery) {
      setValue('email', emailFromQuery); // Pre-fill email from query param
    }
  }, [searchParams, setValue]);

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setIsLoading(true);
    setFormMessage(null); // Clear previous messages

    try {
      // TODO: Call API to /api/auth/login with { email, password }
      // For the PoC, we'll simulate a successful login after a delay
      console.log('Login attempt with:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Based on API response, handle actual login success/failure
      // If successful:
      // router.push('/dashboard'); // Or onboarding if not completed
      
      // For PoC, simulate redirect
       router.push('/onboarding'); // Default to onboarding as per original PoC logic
    } catch (error) {
      console.error('Login failed:', error);
      // This error message will come from the actual API call in the future
      setFormMessage({ type: 'error', message: 'Invalid email or password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Log In</h2>

      {formMessage && (
        <div className={`alert ${
          formMessage.type === 'error' ? 'alert-error' : 
          formMessage.type === 'success' ? 'alert-success' : 'alert-info'
        } text-sm`}>
          {formMessage.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && <span className="text-error text-xs mt-1">{errors.email.message}</span>}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
            {...register('password', {
              required: 'Password is required',
            })}
          />
          {errors.password && <span className="text-error text-xs mt-1">{errors.password.message}</span>}
        </div>

        <div className="flex justify-between items-center">
          <div className="form-control">
            <label className="label cursor-pointer">
              <input type="checkbox" className="checkbox checkbox-sm" {...register('rememberMe')} />
              <span className="label-text ml-2">Remember me</span>
            </label>
          </div>
          <a href="#" className="text-sm text-primary hover:underline"> {/* TODO: Implement forgot password */}
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