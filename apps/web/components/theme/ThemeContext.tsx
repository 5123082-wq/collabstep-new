'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'cv-theme-mode';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => 'system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => 'dark');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setMode(stored);
      }
    } catch (error) {
      console.error('Failed to read theme from storage', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const systemTheme = getSystemTheme();
    const nextTheme: ResolvedTheme = mode === 'system' ? systemTheme : mode;
    setResolvedTheme(nextTheme);
    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }

    const handler = (event: MediaQueryListEvent) => {
      if (mode === 'system') {
        const updated: ResolvedTheme = event.matches ? 'dark' : 'light';
        setResolvedTheme(updated);
        applyTheme(updated);
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode]);

  const setModeSafe = useCallback((next: ThemeMode) => {
    setMode(next);
  }, []);

  const cycleMode = useCallback(() => {
    setMode((current) => {
      if (current === 'system') {
        return 'light';
      }
      if (current === 'light') {
        return 'dark';
      }
      return 'system';
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ mode, resolvedTheme, setMode: setModeSafe, cycleMode }), [
    mode,
    resolvedTheme,
    cycleMode,
    setModeSafe
  ]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
