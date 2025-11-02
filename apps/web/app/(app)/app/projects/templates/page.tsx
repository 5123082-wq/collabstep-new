'use client';

import { useState } from 'react';
import ProjectsDrawerTrigger from '@/components/projects/ProjectsDrawerTrigger';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';
import { flags } from '@/lib/flags';
import ProjectsControlPanel, { type ViewMode } from '@/components/projects/ProjectsControlPanel';
import { TemplatesFilters } from '@/components/projects/section-filters/TemplatesFilters';
import type { TemplateFilterType } from '@/components/projects/section-filters/TemplatesFilters';

export default function ProjectTemplatesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<TemplateFilterType>('all');

  const handleReset = () => {
    setViewMode('grid');
    setActiveFilter('all');
  };

  if (!flags.PROJECTS_OVERVIEW) {
    return (
      <FeatureComingSoon
        // [PLAN:S2-220] Зафлагировано до завершения Stage 2.
        title="Шаблоны проектов"
        description="Раздел доступен в рамках нового обзора проектов. Включите фич-флаг NEXT_PUBLIC_FEATURE_PROJECTS_OVERVIEW, чтобы протестировать функциональность."
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProjectsControlPanel
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onReset={handleReset}
        filters={<TemplatesFilters value={activeFilter} onChange={setActiveFilter} />}
      />

      <section className="rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/60 px-10 py-16 text-center shadow-inner">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Шаблоны</p>
          <h1 className="text-3xl font-semibold text-white">Шаблонов нет</h1>
          <p className="text-base text-neutral-400">
            Опубликуйте первый шаблон из существующего проекта, чтобы команда могла быстро стартовать новые направления.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ProjectsDrawerTrigger entityType="template" entityId="TPL-001" mode="preview">
            Показать карточку шаблона
          </ProjectsDrawerTrigger>
        </div>
      </section>
    </div>
  );
}
