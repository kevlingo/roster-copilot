import { create } from 'zustand';
import { UserProfile } from '@/lib/models/user.models'; // Assuming UserProfile model is defined

// Define the state structure
export interface AuthState { // Added export
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  restoreAuth: () => void; // Added function to restore auth from sessionStorage
}

// Create the store with persistence for better UX
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => {
    // Store in memory and sessionStorage for persistence across page refreshes
    // sessionStorage is cleared when the tab is closed, providing reasonable security
    set({ user, token, isAuthenticated: true });

    // Store in sessionStorage for persistence (better UX than losing auth on refresh)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_user', JSON.stringify(user));
    }

    console.log('User logged in, token set in Zustand store:', token);
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });

    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
    }

    console.log('User logged out, token removed from Zustand store.');
  },
  restoreAuth: () => {
    // Restore authentication state from sessionStorage on app initialization
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('auth_token');
      const userStr = sessionStorage.getItem('auth_user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as UserProfile;
          set({ user, token, isAuthenticated: true });
          console.log('Auth state restored from sessionStorage');
        } catch (error) {
          console.error('Failed to restore auth state:', error);
          // Clear invalid data
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_user');
        }
      }
    }
  },
}));

// Selector examples (optional, can be defined directly in components too)
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.token;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;