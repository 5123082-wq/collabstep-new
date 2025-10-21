'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useWorkspace } from '@/lib/workspace/useWorkspace';
import { toast } from '@/lib/ui/toast';
import type { WorkspaceData } from '@/types/workspace';

export type WorkspaceRenderContext = {
  data: WorkspaceData | null;
  isLoading: boolean;
};

export type WorkspaceSubnavItem = {
  id: string;
  label: string;
  description?: string;
  render: (context: WorkspaceRenderContext) => ReactNode;
};

export type WorkspaceActionContext = {
  refresh: () => Promise<void>;
  data: WorkspaceData | null;
};

export type WorkspaceAction = {
  id: string;
  label: string;
  message?: string;
  onClick?: (context: WorkspaceActionContext) => void | Promise<void>;
};

type WorkspacePageProps = {
  title: string;
  description: string;
  actions: WorkspaceAction[];
  subnav: WorkspaceSubnavItem[];
};

export default function WorkspacePage({ title, description, actions, subnav }: WorkspacePageProps) {
  const { data, updatedAt, isLoading, error, refresh } = useWorkspace();
  const [activeId, setActiveId] = useState(subnav[0]?.id ?? '');
  const active = useMemo(() => subnav.find((item) => item.id === activeId) ?? subnav[0], [subnav, activeId]);
  const showSkeleton = isLoading && !data;
  const hasData = Boolean(data);

  const handleAction = async (action: WorkspaceAction) => {
    if (action.onClick) {
      await action.onClick({ refresh, data });
    }
    if (action.message) {
      toast(action.message);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-neutral-50">{title}</h1>
            <p className="text-sm text-neutral-400">{description}</p>
            {updatedAt ? (
              <p className="text-xs text-neutral-500">Обновлено {new Date(updatedAt).toLocaleString('ru-RU')}</p>
            ) : null}
          </div>
          {actions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => void handleAction(action)}
                  className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {subnav.length > 0 ? (
          <nav className="flex flex-wrap items-center gap-2 text-xs" aria-label="Подразделы страницы">
            {subnav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={clsx(
                  'rounded-full border px-3 py-1 uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                  active?.id === item.id
                    ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-100'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-indigo-500/40 hover:text-white'
                )}
                aria-pressed={active?.id === item.id}
              >
                {item.label}
              </button>
            ))}
          </nav>
        ) : null}
        {active?.description ? (
          <p className="text-xs text-neutral-500">{active.description}</p>
        ) : null}
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-lg border border-rose-400/60 bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-50 transition hover:bg-rose-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              Повторить
            </button>
          </div>
        </div>
      ) : null}

      {showSkeleton ? (
        <div className="space-y-4 rounded-2xl border border-neutral-900 bg-neutral-950/80 p-6">
          <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-800" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
                <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-800" />
                <div className="h-6 w-1/2 animate-pulse rounded bg-neutral-700" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-800" />
              </div>
            ))}
          </div>
        </div>
      ) : hasData && active ? (
        <div className="space-y-4">{active.render({ data, isLoading })}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-8 text-center text-sm text-neutral-400">
          Нет данных для отображения. Попробуйте обновить страницу позже.
        </div>
      )}
    </section>
  );
}
