'use client';

import { useCallback } from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

type ProjectsOverviewTab = 'mine' | 'member';
type ViewMode = 'grid' | 'list';

const TABS: Array<{ value: ProjectsOverviewTab; label: string }> = [
  { value: 'mine', label: 'Мои' },
  { value: 'member', label: 'Я участник' }
];

const GRID_PLACEHOLDER_COUNT = 6;
const LIST_PLACEHOLDER_COUNT = 6;

function FiltersPlaceholder() {
  return (
    <div className="space-y-6 rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6 shadow-inner shadow-black/20">
      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-2 text-sm text-neutral-300">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Поиск</span>
          <div className="pointer-events-none flex h-11 items-center rounded-full border border-neutral-800 bg-neutral-900/70 px-4 text-sm text-neutral-500">
            Поиск по проектам скоро появится
          </div>
        </label>
        <label className="space-y-2 text-sm text-neutral-300">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Сортировка</span>
          <div className="pointer-events-none flex h-11 items-center justify-between rounded-full border border-neutral-800 bg-neutral-900/70 px-4 text-sm text-neutral-500">
            По умолчанию
            <span className="h-2 w-2 rounded-full bg-neutral-700" />
          </div>
        </label>
        <label className="space-y-2 text-sm text-neutral-300">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Статус</span>
          <div className="pointer-events-none flex h-11 items-center rounded-full border border-neutral-800 bg-neutral-900/70 px-4 text-sm text-neutral-500">
            Все проекты
          </div>
        </label>
        <label className="space-y-2 text-sm text-neutral-300">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Теги</span>
          <div className="pointer-events-none flex h-11 items-center rounded-full border border-neutral-800 bg-neutral-900/70 px-4 text-sm text-neutral-500">
            Метки появятся позже
          </div>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-neutral-300">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Владельцы</span>
          <div className="pointer-events-none h-11 rounded-2xl border border-neutral-800 bg-neutral-900/70" />
        </label>
        <label className="space-y-2 text-sm text-neutral-300">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Участники</span>
          <div className="pointer-events-none h-11 rounded-2xl border border-neutral-800 bg-neutral-900/70" />
        </label>
        <label className="space-y-2 text-sm text-neutral-300">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Диапазон дат</span>
          <div className="pointer-events-none grid h-11 grid-cols-2 gap-2">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/70" />
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/70" />
          </div>
        </label>
      </div>
    </div>
  );
}

function GridSkeletonCard() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-neutral-900 bg-neutral-950/60 p-5 shadow-sm shadow-black/20">
      <div className="space-y-3">
        <div className="h-5 w-24 animate-pulse rounded bg-neutral-800/60" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-800/60" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-900/70" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-900/70" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-14 animate-pulse rounded-xl bg-neutral-900/70" />
        <div className="h-14 animate-pulse rounded-xl bg-neutral-900/70" />
        <div className="h-14 animate-pulse rounded-xl bg-neutral-900/70" />
      </div>
      <div className="mt-auto flex items-center gap-3">
        <div className="h-10 flex-1 animate-pulse rounded-full bg-neutral-900/70" />
        <div className="h-10 w-12 animate-pulse rounded-full bg-neutral-900/70" />
      </div>
    </div>
  );
}

function ListSkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-900 bg-neutral-950/60 p-5 shadow-sm shadow-black/20 md:flex-row md:items-center md:justify-between">
      <div className="flex-1 space-y-3">
        <div className="h-5 w-20 animate-pulse rounded bg-neutral-800/60" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-800/60" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-900/70" />
      </div>
      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
        <div className="h-10 flex-1 animate-pulse rounded-full bg-neutral-900/70 md:w-40" />
        <div className="h-10 flex-1 animate-pulse rounded-full bg-neutral-900/70 md:w-32" />
        <div className="h-10 flex-1 animate-pulse rounded-full bg-neutral-900/70 md:w-24" />
      </div>
    </div>
  );
}

export default function ProjectsOverviewPlaceholder() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab: ProjectsOverviewTab = searchParams.get('tab') === 'member' ? 'member' : 'mine';
  const viewMode: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null || value.length === 0) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleTabChange = useCallback(
    (value: ProjectsOverviewTab) => {
      updateParam('tab', value === 'mine' ? null : value);
    },
    [updateParam]
  );

  const handleViewChange = useCallback(
    (value: ViewMode) => {
      updateParam('view', value === 'grid' ? null : value);
    },
    [updateParam]
  );

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Обзор</p>
        <h1 className="text-3xl font-semibold text-white">Проекты</h1>
        <p className="max-w-2xl text-sm text-neutral-400">
          Скоро здесь появится полный список проектов. Пока что вы можете переключаться между табами и режимами просмотра — настраиваем фильтры и данные.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex max-w-full items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950/60 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              aria-pressed={currentTab === tab.value}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                currentTab === tab.value
                  ? 'bg-indigo-500 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 rounded-full border border-neutral-800 bg-neutral-950/60 p-1 text-neutral-400 lg:justify-end">
          <span className="hidden pl-4 text-xs uppercase tracking-wide text-neutral-500 lg:inline">Режим отображения</span>
          <button
            type="button"
            onClick={() => handleViewChange('grid')}
            aria-pressed={viewMode === 'grid'}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
              viewMode === 'grid' ? 'bg-neutral-800/80 text-white' : 'hover:text-white'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Сетка</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewChange('list')}
            aria-pressed={viewMode === 'list'}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
              viewMode === 'list' ? 'bg-neutral-800/80 text-white' : 'hover:text-white'
            )}
          >
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">Список</span>
          </button>
        </div>
      </div>

      <FiltersPlaceholder />

      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: GRID_PLACEHOLDER_COUNT }).map((_, index) => (
            <GridSkeletonCard key={`grid-skeleton-${index}`} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: LIST_PLACEHOLDER_COUNT }).map((_, index) => (
            <ListSkeletonCard key={`list-skeleton-${index}`} />
          ))}
        </div>
      )}
    </section>
  );
}
