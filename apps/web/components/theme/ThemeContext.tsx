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

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    // Игнорируем ошибки при чтении из localStorage
  }
  return 'system';
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Инициализируем сразу из localStorage, чтобы избежать задержки и конфликта с ThemeScript
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  
  // Инициализируем resolvedTheme из уже применённой темы или вычисляем из mode
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_THEME;
    }
    // Проверяем, какая тема уже применена ThemeScript
    const appliedTheme = document.documentElement.dataset.theme as ThemeName | undefined;
    if (appliedTheme === 'light' || appliedTheme === 'dark') {
      return appliedTheme;
    }
    // Если тема ещё не применена, вычисляем из mode
    const stored = getStoredMode();
    if (stored === 'system') {
      return getSystemTheme();
    }
    return stored as ThemeName;
  });

  // Флаг для отслеживания первой инициализации
  const [isInitialized, setIsInitialized] = useState(false);

  // Синхронизируемся с темой, которая уже применена ThemeScript при первой загрузке
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized) {
      return;
    }

    setIsInitialized(true);
    
    // Проверяем текущую применённую тему из DOM
    const appliedTheme = document.documentElement.dataset.theme as ThemeName | undefined;
    if (appliedTheme === 'light' || appliedTheme === 'dark') {
      // Синхронизируем resolvedTheme с уже применённой темой
      setResolvedTheme(appliedTheme);
    } else {
      // Если тема не применена, применяем нашу
      const stored = getStoredMode();
      const systemTheme = getSystemTheme();
      const nextTheme: ResolvedTheme = stored === 'system' ? systemTheme : (stored as ThemeName);
      setResolvedTheme(nextTheme);
      applyThemeTokens(nextTheme);
    }
  }, [isInitialized]);

  // Применяем тему только при изменении mode после инициализации
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) {
      return;
    }

    const systemTheme = getSystemTheme();
    const nextTheme: ResolvedTheme = mode === 'system' ? systemTheme : (mode as ThemeName);
    
    // Применяем тему только если она отличается от текущей
    const currentApplied = document.documentElement.dataset.theme as ThemeName | undefined;
    if (currentApplied !== nextTheme) {
      setResolvedTheme(nextTheme);
      applyThemeTokens(nextTheme);
    }

    // Сохраняем только при реальном изменении пользователем (не при инициализации)
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }

    // Обработчик изменения системной темы
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
  }, [mode, isInitialized]);

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

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, setMode: setModeSafe, cycleMode }),
    [mode, resolvedTheme, cycleMode, setModeSafe]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
