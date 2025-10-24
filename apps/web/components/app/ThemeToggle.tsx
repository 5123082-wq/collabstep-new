'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { useTheme } from '@/components/theme/ThemeContext';

const ICONS = {
  light: 'M12 5a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1Zm0 14a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm7-7a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1ZM4 12a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm12.95-6.364a1 1 0 0 1 0-1.414l1.414-1.415a1 1 0 1 1 1.414 1.415l-1.414 1.414a1 1 0 0 1-1.414 0ZM5.636 17.95a1 1 0 0 1 0 1.414L4.222 20.78a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0ZM18.364 17.95a1 1 0 0 1 1.414 0l1.414 1.414a1 1 0 1 1-1.414 1.414l-1.414-1.414a1 1 0 0 1 0-1.414ZM5.636 4.636a1 1 0 0 1-1.414 0L2.808 3.222A1 1 0 0 1 4.222 1.808l1.414 1.414a1 1 0 0 1 0 1.414ZM12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Z',
  dark: 'M21 12.79A9 9 0 0 1 11.21 3 6.5 6.5 0 1 0 21 12.79Z',
  system:
    'M7 4a5 5 0 0 1 10 0 5 5 0 0 1-5 5 5 5 0 0 1-5-5Zm-1 7a6 6 0 1 1 6 6H6.5A2.5 2.5 0 0 1 4 14.5v-.5A3 3 0 0 1 6 11Z'
};

type IconKey = keyof typeof ICONS;

export default function ThemeToggle() {
  const { mode, resolvedTheme, cycleMode } = useTheme();

  const icon: IconKey = useMemo(() => {
    if (mode === 'system') {
      return 'system';
    }
    return resolvedTheme;
  }, [mode, resolvedTheme]);

  const label = useMemo(() => {
    if (mode === 'system') {
      return 'Тема: система';
    }
    return mode === 'light' ? 'Светлая тема' : 'Тёмная тема';
  }, [mode]);

  return (
    <button
      type="button"
      onClick={cycleMode}
      className={clsx(
        'group flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'border-[color:var(--theme-control-border)] bg-[color:var(--theme-control-bg)] text-[color:var(--theme-control-foreground)]',
        'hover:border-[color:var(--theme-control-border-hover)] hover:text-[color:var(--theme-control-foreground-hover)]'
      )}
      aria-label={`${label}. Нажмите, чтобы переключить`}
      title={`${label} · Кликните для смены режима`}
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5 transition group-hover:scale-105"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={ICONS[icon]} fill="currentColor" />
      </svg>
    </button>
  );
}
