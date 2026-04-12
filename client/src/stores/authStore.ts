import { create } from 'zustand';
import type { IUser } from '@geomhls/shared';
import { api, setAccessToken } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface AuthState {
  user: IUser | null;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  applyToken: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  init: async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      setAccessToken(data.accessToken);
      connectSocket(data.accessToken);
      set({ user: data.user, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.accessToken);
      connectSocket(data.accessToken);
      set({ user: data.user });
    } finally {
      set({ loading: false });
    }
  },

  register: async (email, password, name, username) => {
    set({ loading: true });
    try {
      const theme = (localStorage.getItem('geomhls_theme') as 'dark' | 'light') || 'dark';
      const { data } = await api.post('/auth/register', { email, password, name, username, theme });
      setAccessToken(data.accessToken);
      connectSocket(data.accessToken);
      set({ user: data.user });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setAccessToken(null);
    disconnectSocket();
    set({ user: null });
  },

  setUser: (user) => set({ user }),

  applyToken: async (token) => {
    setAccessToken(token);
    connectSocket(token);
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user });
    } catch {
      get().logout();
    }
  },
}));
