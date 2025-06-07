'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';

interface ResetPasswordFormInputs {
  newPassword: string;
  confirmNewPassword: string;
}

interface ResetPasswordPageProps {
  params: Promise<{
    token: string;
  }>;
}

// Password complexity regex - same as in auth.dto.ts
const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-_+=<>{}[\]|\\:";'.,/~`]).{8,}$/;

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>();

  const newPassword = watch('newPassword');

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        // Redirect to login after successful password reset
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        if (result.errors) {
          // Handle validation errors
          const errorMessages = result.errors
            .map((err: { constraints?: Record<string, string> }) => Object.values(err.constraints || {}).join(', '))
            .join(', ');
          setError(errorMessages);
        } else {
          setError(result.error || 'An error occurred. Please try again.');
        }
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center mb-6">
            Set New Password
          </h2>
          
          <p className="text-sm text-base-content/70 mb-6 text-center">
            Enter your new password below. Make sure it&apos;s strong and secure.
          </p>

          {message && (
            <div className="alert alert-success mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <span>{message}</span>
                <div className="text-sm mt-1">Redirecting to login page...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className={`input input-bordered w-full ${
                  errors.newPassword ? 'input-error' : ''
                }`}
                {...register('newPassword', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.newPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.newPassword.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm New Password</span>
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className={`input input-bordered w-full ${
                  errors.confirmNewPassword ? 'input-error' : ''
                }`}
                {...register('confirmNewPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === newPassword || 'Passwords do not match',
                })}
                disabled={isSubmitting}
              />
              {errors.confirmNewPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.confirmNewPassword.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary w-full ${
                  isSubmitting ? 'loading' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm">
              <Link href="/login" className="link link-primary">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
