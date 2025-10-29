'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuditLogEntry } from '@collabverse/api';
import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import { flags } from '@/lib/flags';

const ACTION_LABELS: Record<string, string> = {
  'project.created': 'Проект создан',
  'project.updated': 'Проект обновлён',
  'project.archived': 'Проект архивирован',
  'project.unarchived': 'Проект разархивирован',
  'project.deleted': 'Проект удалён',
  'task.created': 'Задача создана',
  'task.updated': 'Задача обновлена',
  'task.status_changed': 'Изменён статус задачи',
  'task.time_updated': 'Обновлено время по задаче',
  'file.attached': 'Файл прикреплён'
};

const ACTION_OPTIONS = [
  { value: 'all', label: 'Все события' },
  ...Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))
];

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

type ProjectActivityPageClientProps = {
  projectId: string;
  projectTitle?: string;
};

type ActivityResponse = {
  items?: AuditLogEntry[];
};

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function formatEntity(entry: AuditLogEntry): string {
  const { entity } = entry;
  if (!entity) {
    return '';
  }
  if (entity.type === 'task') {
    return `Задача #${entity.id}`;
  }
  if (entity.type === 'project') {
    return `Проект #${entity.id}`;
  }
  if (entity.type === 'file') {
    return `Вложение #${entity.id}`;
  }
  return `${entity.type} #${entity.id}`;
}

export default function ProjectActivityPageClient({ projectId, projectTitle }: ProjectActivityPageClientProps) {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [action, setAction] = useState<string>('all');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEnabled = flags.PROJECT_ACTIVITY_AUDIT;

  const loadActivity = useCallback(async () => {
    if (!isEnabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', '200');
      if (action && action !== 'all') {
        params.append('action', action);
      }
      if (from) {
        params.set('from', from);
      }
      if (to) {
        params.set('to', to);
      }
      const response = await fetch(`/api/projects/${projectId}/activity?${params.toString()}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить активность');
      }
      const data = (await response.json()) as ActivityResponse;
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [action, from, isEnabled, projectId, to]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const filters = useMemo(
    () => (
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
          value={action}
          onChange={(event) => setAction(event.target.value)}
        >
          {ACTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-neutral-400">
          <span>С</span>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-neutral-400">
          <span>По</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => void loadActivity()}
          className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 transition hover:border-indigo-400 hover:text-white"
        >
          Обновить
        </button>
      </div>
    ),
    [action, from, loadActivity, to]
  );

  return (
    <ProjectPageFrame
      slug="activity"
      title={projectTitle}
      description="Актуальная активность проекта и задач."
      filters={filters}
    >
      {isEnabled ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-6 text-sm text-neutral-400">
              Загрузка активности…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100">{error}</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/50 p-6 text-sm text-neutral-400">
              Здесь появится история изменений по проекту и задачам.
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((entry) => (
                <li key={entry.id} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-100">{getActionLabel(entry.action)}</p>
                      <p className="text-xs text-neutral-400">{formatEntity(entry)}</p>
                    </div>
                    <span className="text-xs text-neutral-500">{dateFormatter.format(new Date(entry.createdAt))}</span>
                  </div>
                  <div className="mt-3 text-xs text-neutral-400">
                    Исполнитель: <span className="text-neutral-200">{entry.actorId}</span>
                  </div>
                  {entry.after && entry.before && entry.action !== 'project.created' ? (
                    <details className="mt-3 text-xs text-neutral-400">
                      <summary className="cursor-pointer text-neutral-300">Изменения</summary>
                      <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-neutral-950/80 p-3 text-[11px] text-neutral-400">
                        {JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-6 text-sm text-neutral-400">
          Раздел активности отключён конфигурацией.
        </div>
      )}
    </ProjectPageFrame>
  );
}
