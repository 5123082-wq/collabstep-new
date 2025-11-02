'use client';

import { useState } from 'react';
import ProjectsDrawerTrigger from '@/components/projects/ProjectsDrawerTrigger';
import ProjectsControlPanel, { type ViewMode } from '@/components/projects/ProjectsControlPanel';
import { ArchiveFilters } from '@/components/projects/section-filters/ArchiveFilters';
import type { ArchiveFilterType } from '@/components/projects/section-filters/ArchiveFilters';

export default function ProjectsArchivePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<ArchiveFilterType>('all');

  const handleReset = () => {
    setViewMode('grid');
    setActiveFilter('all');
  };

  return (
    <div className="space-y-6">
      <ProjectsControlPanel
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onReset={handleReset}
        filters={<ArchiveFilters value={activeFilter} onChange={setActiveFilter} />}
      />

      <section className="rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/60 px-10 py-16 text-center shadow-inner">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Архив</p>
          <h1 className="text-3xl font-semibold text-white">Архив пуст</h1>
          <p className="text-base text-neutral-400">
            Когда вы отправите проекты в архив, они появятся здесь с возможностью восстановить их обратно в работу.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ProjectsDrawerTrigger entityType="project" entityId="ARCH-404" mode="archived">
            Показать карточку из архива
          </ProjectsDrawerTrigger>
        </div>
      </section>
    </div>
  );
}
