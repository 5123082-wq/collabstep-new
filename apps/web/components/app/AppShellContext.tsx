'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

type AppShellContextValue = {
  openCreateMenu: () => void;
  openCommandPalette: () => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function AppShellProvider({
  openCreateMenu,
  openCommandPalette,
  children
}: AppShellContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({
      openCreateMenu,
      openCommandPalette
    }),
    [openCommandPalette, openCreateMenu]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell(): AppShellContextValue {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error('useAppShell must be used within an AppShellProvider');
  }

  return context;
}
