import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          set({ 
            user: response.user, 
            isLoading: false, 
            isAuthenticated: true 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          set({ 
            user: response.user, 
            isLoading: false, 
            isAuthenticated: true 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
          set({ user: null, isLoading: false, isAuthenticated: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.getCurrentUser();
          set({ 
            user: response.user, 
            isLoading: false, 
            isAuthenticated: !!response.user 
          });
        } catch (error) {
          set({ user: null, isLoading: false, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);