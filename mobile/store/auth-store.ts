import { create } from 'zustand';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api'; 

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  checkAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  setSession: (token: string, user?: User) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
      
      const { data } = await api.get('/user/me');
      
      if (data) {
        set({ user: data.user, isAuthenticated: true });
      } else {
        await storage.removeToken();
        set({ user: null, isAuthenticated: false });
      }
    } catch (e) {
      await storage.removeToken();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    const { data } = await api.post('/auth/sign-in/email', { email, password });
    
    if (data?.token) {
        await storage.setToken(data.token);
        const user = data.user || (await api.get('/user/me')).data.user;
        set({ user, isAuthenticated: true });
    }
  },

  signUp: async (email, password, name) => {
    const { data } = await api.post('/auth/sign-up/email', { email, password, name });
    
    if (data?.token) {
        await storage.setToken(data.token);
        const user = data.user || (await api.get('/user/me')).data.user;
        set({ user, isAuthenticated: true });
    }
  },

  setSession: async (token, user) => {
    await storage.setToken(token);
    
    if (user) {
      set({ user, isAuthenticated: true });
    } else {
      await get().checkAuth(); 
    }
  },

  signOut: async () => {
    await storage.removeToken();
    set({ user: null, isAuthenticated: false });
  },
}));