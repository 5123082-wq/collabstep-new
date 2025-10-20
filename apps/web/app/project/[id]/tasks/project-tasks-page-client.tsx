'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Iteration, ProjectWorkflow, Task, TaskStatus } from '@/domain/projects/types';

type TaskItem = Pick<Task, 'id' | 'title' | 'status' | 'iterationId'>;

type IterationItem = Pick<Iteration, 'id' | 'title'>;

type ProjectTasksPageClientProps = {
  projectId: string;
  projectTitle: string;
  initialView?: string;
};

const DEFAULT_STATUSES: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];

export default function ProjectTasksPageClient({ projectId, projectTitle, initialView }: ProjectTasksPageClientProps) {
  const [mode, setMode] = useState<'list' | 'kanban'>(initialView === 'kanban' ? 'kanban' : 'list');
  const [items, setItems] = useState<TaskItem[]>([]);
  const [workflow, setWorkflow] = useState<ProjectWorkflow | null>(null);
  const [iterations, setIterations] = useState<IterationItem[]>([]);
  const [selectedIteration, setSelectedIteration] = useState<string | 'all'>('all');
  const [title, setTitle] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statuses = useMemo(() => workflow?.statuses ?? DEFAULT_STATUSES, [workflow]);
  const iterationNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const iter of iterations) {
      map.set(iter.id, iter.title);
    }
    return map;
  }, [iterations]);

  const loadWorkflow = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/workflow`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить workflow');
      }
      const data = (await response.json()) as ProjectWorkflow;
      setWorkflow(data);
    } catch (err) {
      console.error(err);
      setWorkflow({ projectId, statuses: DEFAULT_STATUSES });
    }
  }, [projectId]);

  const loadIterations = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/iterations`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить итерации');
      }
      const data = (await response.json()) as { items?: IterationItem[] };
      setIterations(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error(err);
      setIterations([]);
    }
  }, [projectId]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedIteration !== 'all') {
        params.set('iterationId', selectedIteration);
      }
      const query = params.toString();
      const response = await fetch(`/api/projects/${projectId}/tasks${query ? `?${query}` : ''}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить задачи');
      }
      const data = (await response.json()) as { items?: TaskItem[] };
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedIteration]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadWorkflow(), loadIterations(), loadTasks()]);
  }, [loadIterations, loadTasks, loadWorkflow]);

  useEffect(() => {
    void loadWorkflow();
    void loadIterations();
  }, [loadIterations, loadWorkflow]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleAdd = async () => {
    if (!title.trim() || isSubmitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { title: title.trim() };
      if (selectedIteration !== 'all') {
        payload.iterationId = selectedIteration;
      }
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Не удалось добавить задачу');
      }
      setTitle('');
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransition = async (taskId: string, toStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId, toStatus })
      });
      if (!response.ok) {
        throw new Error('Не удалось обновить статус');
      }
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  const renderStatusControls = (task: TaskItem) => {
    const available = statuses.filter((status) => status !== task.status);
    if (available.length === 0) {
      return null;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {available.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => handleTransition(task.id, status)}
            className="rounded-lg border border-neutral-800 px-3 py-1 text-xs text-neutral-300 transition hover:border-indigo-400 hover:text-white"
          >
            → {status}
          </button>
        ))}
      </div>
    );
  };

  const grouped = useMemo(() => {
    const map = new Map<TaskStatus, TaskItem[]>();
    for (const status of statuses) {
      map.set(status, []);
    }
    const firstStatus = statuses[0];
    for (const task of items) {
      const bucket = map.get(task.status);
      if (bucket) {
        bucket.push(task);
      } else {
        if (firstStatus) {
          const fallback = map.get(firstStatus);
          if (fallback) {
            fallback.push(task);
          }
        }
      }
    }
    return statuses.map((status) => ({ status, tasks: map.get(status) ?? [] }));
  }, [items, statuses]);

  return (
    <div className="space-y-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Задачи</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-white">{projectTitle}</h1>
            <p className="text-sm text-neutral-400">
              Управляйте задачами проекта, статуса и итерациями.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-1 text-xs text-neutral-300">
            <button
              type="button"
              onClick={() => setMode('list')}
              className={`rounded-lg px-3 py-1 font-medium transition ${mode === 'list' ? 'bg-indigo-500 text-white' : 'hover:text-white'}`}
            >
              Список
            </button>
            <button
              type="button"
              onClick={() => setMode('kanban')}
              className={`rounded-lg px-3 py-1 font-medium transition ${mode === 'kanban' ? 'bg-indigo-500 text-white' : 'hover:text-white'}`}
            >
              Канбан
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
        <input
          className="min-w-[200px] flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          placeholder="Новая задача…"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <select
          className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          value={selectedIteration}
          onChange={(event) => setSelectedIteration(event.target.value as 'all' | string)}
        >
          <option value="all">Все итерации</option>
          {iterations.map((iter) => (
            <option key={iter.id} value={iter.id}>
              {iter.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? 'Добавление…' : 'Добавить'}
        </button>
        <button
          type="button"
          onClick={() => void refreshAll()}
          className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-300 transition hover:border-indigo-400 hover:text-white"
        >
          Обновить
        </button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <section className="space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-400">Загрузка…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
            Пока нет задач. Добавьте первую, чтобы начать работу.
          </div>
        ) : mode === 'kanban' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {grouped.map((column) => (
              <div key={column.status} className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
                <div>
                  <p className="text-sm font-semibold capitalize text-white">{column.status.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-neutral-500">{column.tasks.length} задач</p>
                </div>
                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <article key={task.id} className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/70 p-3">
                      <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                      {renderStatusControls(task)}
                    </article>
                  ))}
                  {column.tasks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-neutral-800 p-3 text-xs text-neutral-500">
                      Нет задач
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((task) => (
              <li key={task.id} className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{task.title}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-indigo-300">{task.status}</div>
                  </div>
                  {task.iterationId ? (
                    <span className="rounded-lg border border-neutral-800 px-2 py-1 text-xs text-neutral-400">
                      Итерация: {iterationNames.get(task.iterationId) ?? task.iterationId}
                    </span>
                  ) : null}
                </div>
                {renderStatusControls(task)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
