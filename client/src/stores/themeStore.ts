import { create } from 'zustand';
import type { Theme } from '@geomhls/shared';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'geomhls_theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme);
  localStorage.setItem(STORAGE_KEY, theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0f' : '#f8f8fc');
}

const initial = getInitialTheme();
applyTheme(initial);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
}));
