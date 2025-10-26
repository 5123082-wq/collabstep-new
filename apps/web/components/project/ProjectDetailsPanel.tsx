'use client';

import { useEffect } from 'react';
import type { ProjectStage } from '@/domain/projects/types';
import { useProjectCatalog } from '@/hooks/projects/useProjectCatalog';
import { useProjectEditor } from '@/hooks/projects/useProjectEditor';

const STAGE_LABELS: Partial<Record<ProjectStage, string>> = {
  discovery: 'Discovery',
  design: 'Дизайн',
  build: 'Разработка',
  launch: 'Запуск',
  support: 'Поддержка'
};

function formatDate(value?: string) {
  if (!value) {
    return '—';
  }
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

export default function ProjectDetailsPanel() {
  const { selectedProjectId } = useProjectCatalog();
  const { project, loading, error, loadProject, reset } = useProjectEditor();

  useEffect(() => {
    if (selectedProjectId) {
      void loadProject(selectedProjectId);
    } else {
      reset();
    }
  }, [loadProject, reset, selectedProjectId]);

  return (
    <section
      aria-label="Детали проекта"
      className="rounded-3xl border border-neutral-900/70 bg-neutral-950/60 p-4 shadow-sm shadow-neutral-950/10"
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Детали проекта</h2>
          <p className="text-sm text-neutral-400">Ключевые сведения и статус выбранного проекта</p>
        </div>
      </header>

      {loading ? (
        <div className="space-y-4" aria-live="polite">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-6 animate-pulse rounded-lg bg-neutral-900/40" aria-hidden="true" />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error && !project ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/80 p-6 text-sm text-neutral-400">
          Выберите проект из списка, чтобы увидеть подробности.
        </div>
      ) : null}

      {!loading && !error && project ? (
        <dl className="space-y-4 text-sm text-neutral-300">
          <div>
            <dt className="text-xs uppercase tracking-[0.24em] text-neutral-500">Название</dt>
            <dd className="mt-1 text-base font-semibold text-white">{project.title}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.24em] text-neutral-500">Описание</dt>
            <dd className="mt-1 whitespace-pre-wrap text-neutral-200">{project.description ?? 'Описание появится позже'}</dd>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-neutral-500">Этап</dt>
              <dd className="mt-1 flex items-center gap-2">
                <span className="rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-200">
                  {project.stage ? STAGE_LABELS[project.stage] ?? project.stage : 'Не указан'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-neutral-500">Статус</dt>
              <dd className="mt-1 text-neutral-200">{project.archived ? 'Архив' : 'Активный'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-neutral-500">Создан</dt>
              <dd className="mt-1 text-neutral-200">{formatDate(project.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-neutral-500">Обновлён</dt>
              <dd className="mt-1 text-neutral-200">{formatDate(project.updatedAt)}</dd>
            </div>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
