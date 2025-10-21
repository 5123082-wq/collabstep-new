'use client';

import Link from 'next/link';
import ProjectActions from './ProjectActions';

const STAGE_ORDER = [
  'Идея',
  'Бриф',
  'Набор команды',
  'Дизайн',
  'Разработка',
  'Маркетинг',
  'Производство',
  'Запуск'
] as const;

type ProjectHeaderProps = {
  name: string;
  stage: string;
  visibility: 'private' | 'public';
  onOpenCreate?: () => void;
};

function StageBadge({ stage }: { stage: string }) {
  const index = STAGE_ORDER.findIndex((item) => item.toLowerCase() === stage.toLowerCase());
  const normalized = index >= 0 ? STAGE_ORDER[index] : stage;

  return (
    <span className="rounded-full border border-indigo-500/50 bg-indigo-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
      {normalized}
    </span>
  );
}

function VisibilityBadge({ visibility }: { visibility: 'private' | 'public' }) {
  const label = visibility === 'public' ? 'Публичный проект' : 'Приватный проект';
  return (
    <span className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-300">
      {label}
    </span>
  );
}

export default function ProjectHeader({ name, stage, visibility, onOpenCreate }: ProjectHeaderProps) {
  const currentStageIndex = STAGE_ORDER.findIndex((item) => item.toLowerCase() === stage.toLowerCase());

  return (
    <header className="border-b border-neutral-900 bg-neutral-950/80 px-6 py-6 shadow-lg shadow-neutral-950/30">
      <nav aria-label="Хлебные крошки">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <li>
            <Link href="/project" className="rounded-md px-2 py-1 transition hover:bg-neutral-800 hover:text-neutral-200">
              Мои проекты
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="rounded-md bg-neutral-900/70 px-2 py-1 text-neutral-200">
            {name}
          </li>
        </ol>
      </nav>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{name}</h1>
            {onOpenCreate && (
              <button
                type="button"
                onClick={onOpenCreate}
                className="rounded-2xl border border-indigo-500/60 bg-indigo-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                aria-label="Открыть меню создания"
              >
                + Создать
              </button>
            )}
            <StageBadge stage={stage} />
            <VisibilityBadge visibility={visibility} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            {STAGE_ORDER.map((item, index) => {
              const isCompleted = currentStageIndex >= 0 && index <= currentStageIndex;
              return (
                <span
                  key={item}
                  className={`rounded-full px-2 py-1 transition ${
                    isCompleted ? 'bg-indigo-500/20 text-indigo-200' : 'bg-neutral-900/50 text-neutral-500'
                  }`}
                >
                  {item}
                </span>
              );
            })}
          </div>
        </div>
        <ProjectActions className="flex-shrink-0" />
      </div>
    </header>
  );
}
