'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_THEME, applyThemeTokens, type ThemeName } from '@/design-tokens';

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
    return DEFAULT_THEME;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => 'system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => DEFAULT_THEME);

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
    const nextTheme: ResolvedTheme = mode === 'system' ? systemTheme : (mode as ThemeName);
    setResolvedTheme(nextTheme);
    applyThemeTokens(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }

    const handler = (event: MediaQueryListEvent) => {
      if (mode === 'system') {
        const updated: ResolvedTheme = event.matches ? 'dark' : 'light';
        setResolvedTheme(updated);
        applyThemeTokens(updated);
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
