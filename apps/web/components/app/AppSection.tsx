'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { canAccessAdmin, canAccessFinance, getUserRoles } from '@/lib/auth/roles';
import { toast } from '@/lib/ui/toast';
import RoadmapBadge from '@/components/roadmap/RoadmapBadge';
import { ROADMAP_HINTS } from '@/lib/feature-flags';
import { getStageRangeFor, type RoadmapSectionId } from '@/lib/roadmap';

type Access = 'finance' | 'admin' | null;

type SectionAction = {
  label: string;
  message: string;
};

type AppSectionProps = {
  title: string;
  description: string;
  actions: SectionAction[];
  access?: Access;
  emptyMessage?: string;
  errorMessage?: string;
  roadmap?: {
    sectionId: RoadmapSectionId;
    status: 'DEMO' | 'COMING_SOON' | 'LIVE';
    message?: string;
    neutralMessage?: string;
    linkLabel?: string;
  };
};

const states = [
  { id: 'default', label: 'Контент' },
  { id: 'loading', label: 'Загрузка' },
  { id: 'empty', label: 'Пусто' },
  { id: 'error', label: 'Ошибка' }
] as const;

export default function AppSection({
  title,
  description,
  actions,
  access = null,
  emptyMessage = 'Здесь пока ничего нет. Начните с действия справа.',
  errorMessage = 'Что-то пошло не так. Повторите попытку.',
  roadmap
}: AppSectionProps) {
  const [state, setState] = useState<(typeof states)[number]['id']>('default');
  const roles = getUserRoles();

  const stageRange = roadmap ? getStageRangeFor(roadmap.sectionId) : null;
  const roadmapMessage = roadmap?.message;
  const neutralMessage =
    roadmap?.neutralMessage ?? 'Этот раздел находится в демо-режиме. Функциональность будет доступна позже.';

  if (access === 'admin' && !canAccessAdmin(roles)) {
    return (
      <section className="rounded-2xl border border-neutral-900 bg-neutral-950/80 p-10 text-center">
        <h2 className="text-xl font-semibold text-neutral-100">Нет доступа</h2>
        <p className="mt-2 text-sm text-neutral-400">Этот раздел доступен только администраторам или модераторам.</p>
      </section>
    );
  }

  if (access === 'finance' && !canAccessFinance(roles)) {
    return (
      <section className="rounded-2xl border border-neutral-900 bg-neutral-950/80 p-10 text-center">
        <h2 className="text-xl font-semibold text-neutral-100">Нет доступа</h2>
        <p className="mt-2 text-sm text-neutral-400">Финансовые данные доступны руководителям проектов и администраторам.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-50">{title}</h1>
            <p className="text-sm text-neutral-400">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {roadmap && stageRange ? (
              <RoadmapBadge
                status={roadmap.status}
                stageHint={stageRange}
                roadmapHref="/app/roadmap"
                {...(roadmap.linkLabel ? { linkLabel: roadmap.linkLabel } : {})}
              />
            ) : null}
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => toast(action.message)}
                className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {states.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setState(item.id)}
              className={clsx(
                'rounded-full border px-3 py-1 uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                state === item.id
                  ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-100'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-indigo-500/40 hover:text-white'
              )}
              aria-pressed={state === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {state === 'loading' && (
        <div className="space-y-4 rounded-2xl border border-neutral-900 bg-neutral-950/80 p-6">
          <div className="h-4 w-1/4 animate-pulse rounded bg-neutral-800" />
          <div className="space-y-3">
            <div className="h-3 w-full animate-pulse rounded bg-neutral-800" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-800" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-800" />
          </div>
        </div>
      )}

      {state === 'empty' && (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-8 text-center text-sm text-neutral-400">
          {emptyMessage}
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100">
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={() => toast('TODO: Повторить загрузку')}
            className="mt-4 rounded-lg border border-rose-400/60 bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-50 transition hover:bg-rose-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
          >
            Повторить
          </button>
        </div>
      )}

      {state === 'default' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-6">
            <p className="text-sm text-neutral-300">
              {ROADMAP_HINTS && roadmapMessage ? roadmapMessage : neutralMessage}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
                <p className="text-sm font-semibold text-neutral-100">Карточка #{index + 1}</p>
                <p className="mt-2 text-xs text-neutral-400">
                  Данные обновятся автоматически после подключения реальных источников.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
