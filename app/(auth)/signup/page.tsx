'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { SignUpDto } from '@/lib/dtos/auth.dto'; // Assuming this DTO can be used on frontend too

// Password complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
// Regex from: https://ihateregex.io/expr/password
const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

type Inputs = SignUpDto & { terms: boolean }; // Add terms field for form

export default function SignupPage() {
  // const router = useRouter(); // router was unused
  const [isLoading, setIsLoading] = useState(false);
  // For general API errors or success messages not tied to a specific field
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({ mode: 'onTouched' }); // Validate on touch for better UX

  const passwordValue = watch('password'); // To compare with passwordConfirmation

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setFormMessage(null);

    const payload: SignUpDto = {
      username: data.username,
      email: data.email,
      password: data.password,
      passwordConfirmation: data.passwordConfirmation,
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle API errors (e.g., validation errors, user already exists)
        if (result.errors && Array.isArray(result.errors)) {
          // Example: { errors: [{ property: 'username', message: '...'}]}
          // For simplicity, just showing the first error or a generic one.
          // A more sophisticated UI would map these to specific fields.
          const firstError = result.errors[0];
          setFormMessage({ type: 'error', message: firstError?.message || 'Sign up failed. Please check your input.' });
        } else {
          setFormMessage({ type: 'error', message: result.error || 'An unexpected error occurred.' });
        }
      } else {
        // Handle success (AC10: inform user verification email sent)
        setFormMessage({ type: 'success', message: result.message || 'Registration successful! Please check your email to verify your account.' });
        // Optionally, redirect or clear form after a delay
        // For now, we just show the success message.
        // router.push('/login?signup=success'); // Or to a page saying "check your email"
      }
    } catch (error) {
      console.error('Signup submission failed:', error);
      setFormMessage({ type: 'error', message: 'Failed to connect to the server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Create Account</h2>

      {formMessage && (
        <div className={`alert ${formMessage.type === 'error' ? 'alert-error' : 'alert-success'} text-sm`}>
          {formMessage.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label htmlFor="usernameInput" className="label">
            <span className="label-text">Username</span>
          </label>
          <input
            id="usernameInput"
            type="text"
            placeholder="fantasy_champion"
            className={`input input-bordered w-full ${errors.username ? 'input-error' : ''}`}
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' },
              maxLength: { value: 50, message: 'Username cannot exceed 50 characters' },
            })}
          />
          {errors.username && <span className="text-error text-xs mt-1">{errors.username.message}</span>}
        </div>

        <div className="form-control">
          <label htmlFor="emailInput" className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            id="emailInput"
            type="email"
            placeholder="your@email.com"
            className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
              maxLength: { value: 255, message: 'Email cannot exceed 255 characters' },
            })}
          />
          {errors.email && <span className="text-error text-xs mt-1">{errors.email.message}</span>}
        </div>

        <div className="form-control">
          <label htmlFor="passwordInput" className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            id="passwordInput"
            type="password"
            placeholder="••••••••"
            className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              pattern: {
                value: PASSWORD_REGEX,
                message: 'Password must contain an uppercase, lowercase, number, and special character.',
              },
            })}
          />
          {errors.password && <span className="text-error text-xs mt-1">{errors.password.message}</span>}
        </div>

        <div className="form-control">
          <label htmlFor="passwordConfirmationInput" className="label">
            <span className="label-text">Confirm Password</span>
          </label>
          <input
            id="passwordConfirmationInput"
            type="password"
            placeholder="••••••••"
            className={`input input-bordered w-full ${errors.passwordConfirmation ? 'input-error' : ''}`}
            {...register('passwordConfirmation', {
              required: 'Please confirm your password',
              validate: (value) => value === passwordValue || 'Passwords do not match',
            })}
          />
          {errors.passwordConfirmation && <span className="text-error text-xs mt-1">{errors.passwordConfirmation.message}</span>}
        </div>

        <div className="form-control">
          <label htmlFor="termsInput" className="label cursor-pointer">
            <input
              id="termsInput"
              type="checkbox"
              className={`checkbox checkbox-sm ${errors.terms ? 'checkbox-error' : ''}`}
              {...register('terms', { required: 'You must agree to the terms' })}
            />
            <span className="label-text ml-2">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.terms && <span className="text-error text-xs mt-1">{errors.terms.message}</span>}
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