'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import type { Project, Task } from '@/domain/projects/types';
import type { TaskDependency } from '@/domain/projects/task-dependency';
import type { AuditLogEntry } from '@collabverse/api';
import ProgressWidget from '@/components/project/widgets/ProgressWidget';
import DeadlinesWidget from '@/components/project/widgets/DeadlinesWidget';
import ActivityWidget from '@/components/project/widgets/ActivityWidget';
import BudgetWidget from '@/components/project/widgets/BudgetWidget';
import DependenciesWidget from '@/components/project/widgets/DependenciesWidget';

const quickLinks = [
  { href: (id: string) => `/project/${id}/tasks`, label: 'Задачи' },
  { href: (id: string) => `/project/${id}/files`, label: 'Файлы' },
  { href: (id: string) => `/project/${id}/chat`, label: 'Чат' },
  { href: (id: string) => `/project/${id}/settings`, label: 'Настройки' }
] as const;

type ProjectDashboardPageClientProps = {
  projectId: string;
};

type ProjectResponse = Project & {
  error?: never;
};

export function ProjectDashboardPageClient({ projectId }: ProjectDashboardPageClientProps) {
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [activities, setActivities] = useState<AuditLogEntry[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить проект');
      }
      const data = (await response.json()) as ProjectResponse;
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setProject(null);
    }
  }, [projectId]);

  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить задачи');
      }
      const data = (await response.json()) as { items?: Task[]; tree?: Task[] };
      setTasks(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTasks([]);
    }
  }, [projectId]);

  const loadDependencies = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/dependencies`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить зависимости');
      }
      const data = (await response.json()) as { items?: TaskDependency[] };
      setDependencies(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('Failed to load dependencies:', err);
      setDependencies([]);
    }
  }, [projectId]);

  const loadActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/activity?limit=10`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить активность');
      }
      const data = (await response.json()) as { items?: AuditLogEntry[] };
      setActivities(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setActivities([]);
    }
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadProject(), loadTasks(), loadDependencies(), loadActivities()]);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [loadProject, loadTasks, loadDependencies, loadActivities]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Загрузка проекта…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 text-center text-sm text-neutral-400">
          <p>{error ?? 'Проект не найден.'}</p>
          <p className="mt-2 text-xs text-neutral-500">
            Проверьте ссылку или создайте проект заново.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Дашборд проекта</p>
        <h1 className="text-4xl font-semibold text-white">{project.title}</h1>
        <p className="text-sm text-neutral-400">
          Стадия: {project.stage ?? 'discovery'} · Владелец: {project.ownerId}
        </p>
        <nav aria-label="Быстрые ссылки" className="flex flex-wrap gap-3 pt-4">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href(project.id)}
              className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200 transition hover:border-indigo-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <ProgressWidget tasks={tasks} isLoading={isLoading} />
        {project && (
          <>
            <DeadlinesWidget
              tasks={tasks}
              projectId={projectId}
              projectKey={project.key}
              isLoading={isLoading}
            />
            <BudgetWidget project={project} isLoading={isLoading} />
            <DependenciesWidget
              tasks={tasks}
              dependencies={dependencies}
              projectId={projectId}
              projectKey={project.key}
              isLoading={isLoading}
            />
          </>
        )}
        <ActivityWidget activities={activities} isLoading={isLoading} />
      </section>
    </div>
  );
}

export default ProjectDashboardPageClient;
