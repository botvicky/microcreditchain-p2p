import { create } from 'zustand';
import { User } from '../types';
import { AuthService } from '../services/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loadCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  signUp: async (email, password, userData) => {
    set({ loading: true, error: null });
    try {
      const { user } = await AuthService.signUp(email, password, userData as any);
      set({ user, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await AuthService.signIn(email, password);
      set({ user, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await AuthService.signOut();
      set({ user: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });
    try {
      await AuthService.updateUserProfile(user.id, updates);
      set({ 
        user: { ...user, ...updates }, 
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadCurrentUser: async () => {
    set({ loading: true });
    try {
      const user = await AuthService.getCurrentUser();
      set({ user, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  }
}));
