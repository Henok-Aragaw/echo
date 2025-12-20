import { create } from 'zustand';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await storage.getToken();
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      
      // Fetch user data using Bearer token
      const { data } = await api.get('/user/me'); // Or /user/me depending on implementation
      
      if (data) {
        set({ user: data.user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (e) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    // Using Better Auth Client which handles the Bearer token extraction internally usually,
    // but based on your backend config, we might need to manual fallback if the plugin acts purely as API.
    
    // Using the raw API as requested for robustness with the manual Bearer setup:
    const { data } = await api.post('/auth/sign-in/email', { email, password });
    
    // Assuming backend returns { token, user } or sets a session. 
    // If your Better Auth setup returns a token in the body:
    if (data?.token) {
        await storage.setToken(data.token);
        set({ user: data.user, isAuthenticated: true });
    }
  },

  signUp: async (email, password, name) => {
    const { data } = await api.post('/auth/sign-up/email', { email, password, name });
    if (data?.token) {
        await storage.setToken(data.token);
        set({ user: data.user, isAuthenticated: true });
    }
  },

  signOut: async () => {
    await storage.removeToken();
    set({ user: null, isAuthenticated: false });
  },
}));