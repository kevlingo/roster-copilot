'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard component that protects routes by checking authentication status.
 * Redirects unauthenticated users to the login page.
 */
export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, token, restoreAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First, try to restore authentication state from sessionStorage
    restoreAuth();
  }, [restoreAuth]);

  useEffect(() => {
    // Check authentication status after potential restoration
    if (!isAuthenticated || !token) {
      console.log('[AuthGuard] User not authenticated, redirecting to login');

      // Store the current URL as the intended destination
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      }

      router.push('/login');
      return;
    }

    // User is authenticated, allow access
    setIsLoading(false);
  }, [isAuthenticated, token, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-base-content/70">Checking authentication...</p>
          </div>
        </div>
      )
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
