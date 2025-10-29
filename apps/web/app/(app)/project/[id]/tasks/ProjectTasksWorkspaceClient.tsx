'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import type { TaskStatus } from '@/domain/projects/types';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { useProjectTasksStore } from '@/stores/projectTasksStore';
import { cn } from '@/lib/utils';
import { TASK_STATUS_LABELS } from './components/TaskCard';

type ProjectTasksWorkspaceClientProps = {
  projectId: string;
  projectTitle: string;
  initialView: 'kanban' | 'list';
};

const DEFAULT_STATUSES: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];

export function ProjectTasksWorkspaceClient({ projectId, projectTitle, initialView }: ProjectTasksWorkspaceClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    view,
    setView,
    statusFilter,
    setStatusFilter,
    iterationFilter,
    setIterationFilter,
    hydrate,
    loadTasks,
    isLoading,
    error,
    tasks,
    tree,
    workflow,
    iterations,
    isWorkflowLoading
  } = useProjectTasksStore();

  useEffect(() => {
    void hydrate(projectId);
  }, [hydrate, projectId]);

  useEffect(() => {
    const queryView = (searchParams?.get('view') ?? initialView).toLowerCase();
    const normalized = queryView === 'list' ? 'list' : 'kanban';
    setView(normalized);
  }, [initialView, searchParams, setView]);

  const statuses = useMemo(() => workflow?.statuses ?? DEFAULT_STATUSES, [workflow]);

  const handleViewChange = useCallback(
    (next: 'kanban' | 'list') => {
      setView(next);
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (next === 'list') {
        params.set('view', 'list');
      } else {
        params.delete('view');
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`);
    },
    [pathname, router, searchParams, setView]
  );

  const handleStatusFilterChange = useCallback(
    async (value: 'all' | TaskStatus) => {
      setStatusFilter(value);
      await loadTasks();
    },
    [loadTasks, setStatusFilter]
  );

  const handleIterationFilterChange = useCallback(
    async (value: 'all' | string) => {
      setIterationFilter(value);
      await loadTasks();
    },
    [loadTasks, setIterationFilter]
  );

  const handleTaskDrop = useCallback(
    async (taskId: string, toStatus: TaskStatus) => {
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, toStatus })
        });
        if (!response.ok) {
          const message = await response.text().catch(() => '');
          throw new Error(message || 'Не удалось обновить статус задачи');
        }
        await loadTasks();
      } catch (err) {
        console.error(err);
        useProjectTasksStore.setState({
          error: err instanceof Error ? err.message : 'Не удалось обновить статус задачи'
        });
      }
    },
    [loadTasks, projectId]
  );

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <SegmentedControl
        value={view}
        onChange={handleViewChange}
        options={[
          { value: 'kanban', label: 'Kanban' },
          { value: 'list', label: 'Список' }
        ]}
      />
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <label htmlFor="status-filter" className="text-neutral-500">
          Статус
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(event) => handleStatusFilterChange(event.target.value as 'all' | TaskStatus)}
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">Все</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status] ?? status}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <label htmlFor="iteration-filter" className="text-neutral-500">
          Итерация
        </label>
        <select
          id="iteration-filter"
          value={iterationFilter}
          onChange={(event) => handleIterationFilterChange(event.target.value as 'all' | string)}
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">Все</option>
          {iterations.map((iteration) => (
            <option key={iteration.id} value={iteration.id}>
              {iteration.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <ProjectPageFrame
      slug="tasks"
      title={projectTitle}
      filters={filters}
      actions={
        <button
          type="button"
          className="rounded-xl border border-neutral-800 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-400 hover:bg-indigo-500/20"
        >
          Создать задачу
        </button>
      }
    >
      {error ? (
        <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {view === 'list' ? (
        <ListView tree={tree} isLoading={isLoading} />
      ) : (
        <KanbanView statuses={statuses} tasks={tasks} onTaskDrop={handleTaskDrop} isLoading={isLoading} />
      )}
      {isWorkflowLoading ? (
        <p className="text-xs text-neutral-500">Обновление workflow…</p>
      ) : null}
    </ProjectPageFrame>
  );
}

type SegmentedControlOption = {
  value: 'kanban' | 'list';
  label: string;
};

type SegmentedControlProps = {
  value: 'kanban' | 'list';
  onChange: (value: 'kanban' | 'list') => void;
  options: SegmentedControlOption[];
};

function SegmentedControl({ value, onChange, options }: SegmentedControlProps) {
  return (
    <div className="flex gap-1 rounded-xl border border-neutral-800 bg-neutral-950/60 p-1 text-xs text-neutral-300">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-3 py-1 transition',
            value === option.value
              ? 'bg-indigo-500/20 text-indigo-200'
              : 'text-neutral-400 hover:text-neutral-100'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default ProjectTasksWorkspaceClient;
