import { create } from 'zustand';
import { UserProfile } from '@/lib/models/user.models'; // Assuming UserProfile model is defined

// Define the state structure
export interface AuthState { // Added export
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  // TODO: Add action for loading token/user from persistent storage if needed in future (e.g., for session restoration)
}

// Create the store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => {
    // For PoC, token is stored in memory.
    // In a real app, consider HttpOnly cookies or more secure storage.
    // As per Frontend-Architecture.md: "Storing in memory via a state management solution like Zustand... is preferred over localStorage."
    set({ user, token, isAuthenticated: true });
    console.log('User logged in, token set in Zustand store:', token);
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    // TODO: Call API to invalidate session on backend if applicable
    console.log('User logged out, token removed from Zustand store.');
  },
}));

// Selector examples (optional, can be defined directly in components too)
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.token;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;