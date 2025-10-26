'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useProjectCatalog } from '@/hooks/projects/useProjectCatalog';
import type { ProjectStage } from '@/domain/projects/types';

const STAGE_LABELS: Partial<Record<ProjectStage, string>> = {
  discovery: 'Discovery',
  design: 'Дизайн',
  build: 'Разработка',
  launch: 'Запуск',
  support: 'Поддержка'
};

function formatUpdatedAt(value: string) {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  } catch (error) {
    console.error(error);
    return '—';
  }
}

export default function ProjectCatalogList() {
  const { filteredProjects, loading, error, refresh, selectProject, selectedProjectId } = useProjectCatalog();

  const sortedProjects = useMemo(
    () =>
      filteredProjects.slice().sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
    [filteredProjects]
  );

  return (
    <section
      aria-label="Каталог проектов"
      className="space-y-4 rounded-3xl border border-neutral-900/70 bg-neutral-950/60 p-4 shadow-sm shadow-neutral-950/10"
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Каталог проектов</h2>
          <p className="text-sm text-neutral-400">Выберите проект, чтобы посмотреть детали и действия</p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} loading={loading} className="self-start sm:self-auto">
          Обновить
        </Button>
      </header>

      {loading && sortedProjects.length === 0 ? (
        <ul className="space-y-3" aria-live="polite">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="h-20 animate-pulse rounded-2xl border border-neutral-900 bg-neutral-900/40"
              aria-hidden="true"
            />
          ))}
        </ul>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={refresh}>
              Попробовать снова
            </Button>
          </div>
        </div>
      ) : null}

      {!loading && !error && sortedProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/80 p-6 text-sm text-neutral-400">
          Проекты не найдены. Попробуйте изменить поисковый запрос или создайте новый проект.
        </div>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2" role="list">
        {sortedProjects.map((project) => {
          const stage = project.stage ? STAGE_LABELS[project.stage] ?? project.stage : 'Не указан';
          const isActive = project.id === selectedProjectId;
          return (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => selectProject(project.id)}
                className={`group flex h-full w-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                  isActive
                    ? 'border-indigo-400/70 bg-indigo-500/10 text-white shadow-[0_16px_32px_-22px_rgba(99,102,241,0.75)]'
                    : 'border-neutral-900 bg-neutral-900/40 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold leading-tight">{project.title}</h3>
                    <p className="text-xs text-neutral-400">Обновлён: {formatUpdatedAt(project.updatedAt)}</p>
                  </div>
                  <span className="rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300">
                    {stage}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                  <span className="rounded-full border border-neutral-800 bg-neutral-900/80 px-2 py-0.5">
                    Задач: {project.tasksCount}
                  </span>
                  {project.labels.slice(0, 3).map((label) => (
                    <span key={label} className="rounded-full border border-neutral-800 bg-neutral-900/80 px-2 py-0.5">
                      {label}
                    </span>
                  ))}
                  {project.labels.length > 3 ? (
                    <span className="rounded-full border border-neutral-800 bg-neutral-900/80 px-2 py-0.5">+{project.labels.length - 3}</span>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
