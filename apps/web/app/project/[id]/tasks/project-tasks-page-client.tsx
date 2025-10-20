'use client';

import { useCallback, useEffect, useState } from 'react';

type TaskItem = {
  id: string;
  title: string;
  status: string;
};

type ProjectTasksPageClientProps = {
  projectId: string;
  projectTitle: string;
};

export default function ProjectTasksPageClient({ projectId, projectTitle }: ProjectTasksPageClientProps) {
  const [items, setItems] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
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
  }, [projectId]);

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
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  return (
    <div className="space-y-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Задачи</p>
        <h1 className="text-3xl font-semibold text-white">{projectTitle}</h1>
        <p className="text-sm text-neutral-400">Управляйте задачами проекта и отслеживайте прогресс команды.</p>
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

      <section className="space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-400">Загрузка…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
            Пока нет задач. Добавьте первую, чтобы начать работу.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((task) => (
              <li key={task.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
                <div className="text-sm font-semibold text-white">{task.title}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-indigo-300">{task.status}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
