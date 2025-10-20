'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type TaskItem = {
  id: string;
  title: string;
  status: string;
};

type Workflow = {
  projectId: string;
  statuses: string[];
};

type ProjectTasksPageClientProps = {
  projectId: string;
  projectTitle: string;
  initialView?: 'list' | 'kanban';
};

export default function ProjectTasksPageClient({
  projectId,
  projectTitle,
  initialView = 'list'
}: ProjectTasksPageClientProps) {
  const [items, setItems] = useState<TaskItem[]>([]);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [title, setTitle] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'list' | 'kanban'>(initialView);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [workflowResponse, tasksResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}/workflow`),
        fetch(`/api/projects/${projectId}/tasks`)
      ]);

      if (!workflowResponse.ok) {
        throw new Error('Не удалось загрузить workflow');
      }
      if (!tasksResponse.ok) {
        throw new Error('Не удалось загрузить задачи');
      }

      const workflowData = (await workflowResponse.json()) as Workflow;
      const tasksData = (await tasksResponse.json()) as { items?: TaskItem[] };

      setWorkflow(workflowData);
      setItems(Array.isArray(tasksData.items) ? tasksData.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleAdd = async () => {
    if (!title.trim() || isSubmitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title.trim() })
      });

      if (!response.ok) {
        throw new Error('Не удалось добавить задачу');
      }

      setTitle('');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMove = useCallback(
    async (taskId: string, toStatus: string) => {
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks/transition`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ taskId, toStatus })
        });

        if (!response.ok) {
          throw new Error('Не удалось изменить статус');
        }

        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      }
    },
    [loadAll, projectId]
  );

  const columns = useMemo(() => workflow?.statuses ?? ['new', 'in_progress', 'review', 'done'], [workflow]);

  return (
    <div className="space-y-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Задачи</p>
          <h1 className="text-3xl font-semibold text-white">{projectTitle}</h1>
          <p className="text-sm text-neutral-400">Управляйте задачами проекта и отслеживайте прогресс.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`rounded-xl px-3 py-2 text-sm ${
              mode === 'list' ? 'bg-indigo-500 text-white' : 'bg-neutral-900 text-neutral-300'
            }`}
            onClick={() => setMode('list')}
          >
            List
          </button>
          <button
            className={`rounded-xl px-3 py-2 text-sm ${
              mode === 'kanban' ? 'bg-indigo-500 text-white' : 'bg-neutral-900 text-neutral-300'
            }`}
            onClick={() => setMode('kanban')}
          >
            Kanban
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
        <input
          className="min-w-[200px] flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          placeholder="Новая задача…"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? 'Добавление…' : 'Добавить'}
        </button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {isLoading ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-400">Загрузка…</div>
      ) : mode === 'list' ? (
        <ul className="space-y-3">
          {items.length === 0 ? (
            <li className="rounded-xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
              Пока нет задач.
            </li>
          ) : (
            items.map((task) => (
              <li key={task.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
                <div className="text-sm font-semibold text-white">{task.title}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-indigo-300">{task.status}</div>
              </li>
            ))
          )}
        </ul>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          {columns.map((column) => (
            <div key={column} className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-3">
              <div className="mb-2 text-sm font-semibold text-white">{column}</div>
              {items.filter((task) => task.status === column).map((task) => (
                <div key={task.id} className="mb-2 rounded-xl border border-neutral-800 bg-neutral-950 p-2">
                  <div className="text-sm text-white">{task.title}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {columns
                      .filter((status) => status !== task.status)
                      .map((status) => (
                        <button
                          key={status}
                          onClick={() => handleMove(task.id, status)}
                          className="text-xs underline text-indigo-300 hover:text-indigo-200"
                        >
                          → {status}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
