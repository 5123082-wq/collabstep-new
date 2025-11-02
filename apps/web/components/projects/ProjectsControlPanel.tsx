'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';
import { LayoutGrid, LayoutList, Settings, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isActivePath, TOPBAR_LINKS } from './projectsTopbar.config';

export type ViewMode = 'grid' | 'list';

export type SectionFilter = {
  id: string;
  label: string;
  value: string;
  active?: boolean;
};

type ProjectsControlPanelProps = {
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onReset?: () => void;
  onSettingsClick?: () => void;
  filters?: ReactNode;
  showNavigation?: boolean;
};

export default function ProjectsControlPanel({
  viewMode = 'grid',
  onViewModeChange,
  onReset,
  onSettingsClick,
  filters,
  showNavigation = true
}: ProjectsControlPanelProps) {
  const pathname = usePathname();

  const links = useMemo(
    () =>
      TOPBAR_LINKS.map((link) => ({
        ...link,
        active: isActivePath(pathname, link)
      })),
    [pathname]
  );

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/60 p-3 shadow-sm shadow-black/10">
      {/* Навигация по разделам */}
      {showNavigation && (
        <nav aria-label="Навигация по разделу проектов" className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                'rounded-lg px-2 py-1 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                link.active
                  ? 'bg-indigo-500 text-white shadow'
                  : 'border border-transparent bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100'
              )}
              aria-current={link.active ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Фильтры и действия */}
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        
        {/* Переключатель вида */}
        {onViewModeChange && (
          <>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                viewMode === 'grid'
                  ? 'border-indigo-400 bg-indigo-500/20 text-white'
                  : 'border-neutral-800 text-neutral-300 hover:border-indigo-400/60 hover:text-white'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                viewMode === 'list'
                  ? 'border-indigo-400 bg-indigo-500/20 text-white'
                  : 'border-neutral-800 text-neutral-300 hover:border-indigo-400/60 hover:text-white'
              )}
            >
              <LayoutList className="h-4 w-4" />
              List
            </button>
          </>
        )}

        {/* Кнопка сброса */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-full border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-indigo-400/60 hover:text-white"
          >
            Сбросить
          </button>
        )}

        {/* Кнопка настроек */}
        {onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-400/60 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-indigo-400 hover:bg-indigo-500/30"
          >
            <Settings className="h-4 w-4" />
            Настройки
          </button>
        )}
      </div>
    </div>
  );
}

