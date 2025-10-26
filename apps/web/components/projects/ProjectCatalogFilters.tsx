'use client';

import { useCallback, type ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { useProjectCatalog } from '@/hooks/projects/useProjectCatalog';
import { PROJECTS_LAYOUT_CLASSNAMES } from '@/components/common/layoutPresets';
import { cn } from '@/lib/utils';

export default function ProjectCatalogFilters() {
  const { searchQuery, setSearchQuery, loading } = useProjectCatalog();

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    [setSearchQuery]
  );

  return (
    <section
      aria-label="Фильтры списка проектов"
      className={cn(
        PROJECTS_LAYOUT_CLASSNAMES.filters,
        'rounded-3xl border border-neutral-900/70 bg-neutral-950/60 p-4 shadow-sm shadow-neutral-950/10'
      )}
    >
      <div>
        <div className="w-full sm:max-w-sm">
          <label htmlFor="project-search" className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Поиск
          </label>
          <Input
            id="project-search"
            type="search"
            autoComplete="off"
            placeholder="Найти проект по названию"
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={loading}
            className="border-neutral-800 bg-neutral-900/60 text-sm text-neutral-100 placeholder:text-neutral-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 sm:justify-end">
          <span className="rounded-full border border-dashed border-neutral-800 px-3 py-1 uppercase tracking-[0.2em]">
            Фильтры в разработке
          </span>
        </div>
      </div>
    </section>
  );
}
