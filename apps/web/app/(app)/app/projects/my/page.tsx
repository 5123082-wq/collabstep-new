'use client';

import { useState } from 'react';
import ProjectsDrawerTrigger from '@/components/projects/ProjectsDrawerTrigger';
import ProjectsControlPanel, { type ViewMode } from '@/components/projects/ProjectsControlPanel';
import { MyProjectsFilters } from '@/components/projects/section-filters/MyProjectsFilters';
import type { MyProjectsFilterType } from '@/components/projects/section-filters/MyProjectsFilters';

export default function MyProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<MyProjectsFilterType>('all');

  const handleReset = () => {
    setViewMode('grid');
    setActiveFilter('all');
  };

  return (
    <div className="space-y-8">
      <header className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-white">Мои проекты</h1>
          <p className="text-sm text-neutral-400">
            Проекты, в которых вы являетесь владельцем или администратором.
          </p>
        </div>
      </header>

      <ProjectsControlPanel
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onReset={handleReset}
        filters={<MyProjectsFilters value={activeFilter} onChange={setActiveFilter} />}
      />

      <section className="rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/60 px-10 py-16 text-center shadow-inner">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Мои проекты</p>
          <h1 className="text-3xl font-semibold text-white">Вы ещё не владеете ни одним проектом</h1>
          <p className="text-base text-neutral-400">
            Запланируйте новый проект или присоединитесь к существующим инициативам, чтобы они появились здесь.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ProjectsDrawerTrigger entityId="OWNER-000" mode="owner-insight">
            Показать карточку владельца
          </ProjectsDrawerTrigger>
        </div>
      </section>
    </div>
  );
}
