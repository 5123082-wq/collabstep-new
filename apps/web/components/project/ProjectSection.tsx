'use client';

import type { ReactNode } from 'react';
import RoadmapBadge from '@/components/roadmap/RoadmapBadge';
import { ROADMAP_HINTS } from '@/lib/feature-flags';
import { getStageRangeFor, type RoadmapSectionId } from '@/lib/roadmap';
import { toast } from '@/lib/ui/toast';

export type SectionAction = {
  id: string;
  label: string;
  toastMessage: string;
  tone?: 'default' | 'primary';
};

type ProjectSectionProps = {
  id: string;
  title: string;
  description: string;
  actions: SectionAction[];
  children?: ReactNode;
  roadmap?: {
    sectionId: RoadmapSectionId;
    status: 'DEMO' | 'COMING_SOON' | 'LIVE';
    message?: string;
  };
};

export function ProjectSection({ id, title, description, actions, children, roadmap }: ProjectSectionProps) {
  const stageRange = roadmap ? getStageRangeFor(roadmap.sectionId) : null;
  return (
    <section id={id} className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6 shadow-sm shadow-neutral-950/20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
          <p className="text-sm text-neutral-400">{description}</p>
          {ROADMAP_HINTS && roadmap?.message ? (
            <p className="mt-2 text-xs text-neutral-500">{roadmap.message}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {roadmap && stageRange ? (
            <RoadmapBadge status={roadmap.status} stageHint={stageRange} roadmapHref="/app/roadmap" />
          ) : null}
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => toast(action.toastMessage)}
              className={`rounded-2xl border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                action.tone === 'primary'
                  ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-100 hover:border-indigo-400 hover:bg-indigo-500/25'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-200 hover:border-indigo-500/40 hover:text-white'
              }`}
              aria-label={action.label}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">{children ?? <ProjectStatePreview />}</div>
    </section>
  );
}

export function ProjectStatePreview() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Загрузка</p>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-neutral-700/70" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-700/50" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-700/40" />
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/30 p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Пусто</p>
        <p className="mt-3 text-sm text-neutral-400">Пока нет данных — добавьте первую запись.</p>
      </div>
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
        <p className="text-xs uppercase tracking-wide text-red-300">Ошибка</p>
        <p className="mt-3 text-sm text-red-200">Не удалось получить данные. Попробуйте повторить попытку.</p>
      </div>
    </div>
  );
}
