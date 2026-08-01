import { create } from 'zustand';
import { tokenService } from '@/services/tokenService';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // true while we're checking for an existing session on app load
  setSession: (user: User, tokens: { accessToken: string; refreshToken: string }, rememberMe?: boolean) => void;
  updateUser: (user: User) => void;
  clearSession: () => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setSession: (user, tokens, rememberMe = true) => {
    tokenService.setStorageMode(rememberMe);
    tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
    set({ user, isAuthenticated: true, isInitializing: false });
  },

  updateUser: (user) => set({ user }),

  clearSession: () => {
    tokenService.clear();
    set({ user: null, isAuthenticated: false, isInitializing: false });
  },

  setInitializing: (value) => set({ isInitializing: value }),
}));
