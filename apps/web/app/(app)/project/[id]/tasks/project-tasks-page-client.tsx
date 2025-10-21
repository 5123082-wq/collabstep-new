'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import type { Iteration, ProjectWorkflow, Task, TaskStatus } from '@/domain/projects/types';
import { toast } from '@/lib/ui/toast';
import { useUndoOperation } from '@/lib/ui/useUndoOperation';

type TaskItem = Pick<
  Task,
  | 'id'
  | 'title'
  | 'status'
  | 'iterationId'
  | 'description'
  | 'assigneeId'
  | 'startAt'
  | 'dueAt'
  | 'labels'
  | 'priority'
>;

type IterationItem = Pick<Iteration, 'id' | 'title'>;

type BoardView = 'list' | 'kanban' | 'calendar' | 'gantt' | 'backlog';

type ProjectTasksPageClientProps = {
  projectId: string;
  projectTitle: string;
  initialView?: string;
  viewsEnabled?: boolean;
};

type TaskUpdatePayload = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  iterationId?: string | null;
  assigneeId?: string | null;
  startAt?: string | null;
  dueAt?: string | null;
  labels?: string[];
  priority?: 'low' | 'med' | 'high' | null;
};

type IterationPayload = {
  title?: string;
  start?: string;
  end?: string;
};

type TaskCreateModalPayload = {
  title: string;
  description?: string;
  status?: TaskStatus;
  iterationId?: string;
  assigneeId?: string;
  startAt?: string | null;
  dueAt?: string | null;
  labels?: string[];
  priority?: 'low' | 'med' | 'high';
};

const DEFAULT_STATUSES: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function parseISODate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfMonth(date: Date) {
  const next = new Date(date);
  next.setDate(1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfMonth(date: Date) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  next.setDate(0);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toInputDateTime(value?: string | null) {
  const parsed = parseISODate(value);
  if (!parsed) {
    return '';
  }
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromInputDate(value: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export default function ProjectTasksPageClient({
  projectId,
  projectTitle,
  initialView,
  viewsEnabled = false
}: ProjectTasksPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const availableViews = useMemo<BoardView[]>(() => {
    if (!viewsEnabled) {
      return ['list', 'kanban'];
    }
    return ['list', 'kanban', 'calendar', 'gantt', 'backlog'];
  }, [viewsEnabled]);
  const defaultView: BoardView = useMemo(() => {
    const candidate = (initialView ?? '').toLowerCase();
    return (availableViews.find((view) => view === candidate) ?? availableViews[0]) as BoardView;
  }, [availableViews, initialView]);

  const [view, setView] = useState<BoardView>(defaultView);
  const [items, setItems] = useState<TaskItem[]>([]);
  const [workflow, setWorkflow] = useState<ProjectWorkflow | null>(null);
  const [iterations, setIterations] = useState<IterationItem[]>([]);
  const [selectedIteration, setSelectedIteration] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [labelsFilter, setLabelsFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [iterationModalOpen, setIterationModalOpen] = useState(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setBulkUpdating] = useState(false);
  const [bulkStatusTarget, setBulkStatusTarget] = useState<TaskStatus>('in_progress');
  const [bulkIterationTarget, setBulkIterationTarget] = useState<'none' | string>('none');
  const { register: registerUndo } = useUndoOperation();

  useEffect(() => {
    if (!availableViews.includes(view) && availableViews.length > 0) {
      setView(availableViews[0] as BoardView);
    }
  }, [availableViews, view]);

  useEffect(() => {
    if (view === 'backlog' && statusFilter !== 'new') {
      setStatusFilter('new');
    }
  }, [statusFilter, view]);

  useEffect(() => {
    if (statuses.length > 0 && !statuses.includes(bulkStatusTarget)) {
      setBulkStatusTarget(statuses[0]!);
    }
  }, [bulkStatusTarget, statuses]);

  useEffect(() => {
    if (bulkIterationTarget !== 'none' && !iterations.some((iter) => iter.id === bulkIterationTarget)) {
      setBulkIterationTarget('none');
    }
  }, [bulkIterationTarget, iterations]);

  const statuses = useMemo(() => workflow?.statuses ?? DEFAULT_STATUSES, [workflow]);

  const iterationNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const iter of iterations) {
      map.set(iter.id, iter.title);
    }
    return map;
  }, [iterations]);

  const syncViewToQuery = useCallback(
    (next: BoardView) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (next === 'list') {
        params.delete('view');
      } else {
        params.set('view', next);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`);
    },
    [pathname, router, searchParams]
  );

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
      const statusFilters: TaskStatus[] = [];
      if (view === 'backlog') {
        statusFilters.push('new');
      } else if (statusFilter !== 'all') {
        statusFilters.push(statusFilter);
      }
      statusFilters.forEach((status) => params.append('status', status));
      if (assigneeFilter.trim()) {
        params.set('assignee', assigneeFilter.trim());
      }
      if (labelsFilter.trim()) {
        labelsFilter
          .split(',')
          .map((label) => label.trim())
          .filter(Boolean)
          .forEach((label) => params.append('label', label));
      }
      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim());
      }
      const query = params.toString();
      const response = await fetch(`/api/projects/${projectId}/tasks${query ? `?${query}` : ''}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить задачи');
      }
      const data = (await response.json()) as { items?: TaskItem[] };
      const nextItems = Array.isArray(data.items) ? data.items : [];
      setItems(nextItems);
      setSelectedTaskIds((prev) => {
        if (prev.size === 0) {
          return prev;
        }
        const available = new Set(nextItems.map((task) => task.id));
        const next = new Set<string>();
        prev.forEach((id) => {
          if (available.has(id)) {
            next.add(id);
          }
        });
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [assigneeFilter, labelsFilter, projectId, searchTerm, selectedIteration, statusFilter, view]);

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

  const handleCreateTask = useCallback(
    async (payload: TaskCreateModalPayload) => {
      const base: Record<string, unknown> = {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        assigneeId: payload.assigneeId,
        startAt: payload.startAt ?? undefined,
        dueAt: payload.dueAt ?? undefined,
        labels: payload.labels,
        priority: payload.priority
      };
      if (payload.iterationId) {
        base.iterationId = payload.iterationId;
      } else if (selectedIteration !== 'all') {
        base.iterationId = selectedIteration;
      }
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(base)
      });
      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || 'Не удалось создать задачу');
      }
      const task = (await response.json()) as TaskItem;
      toast(`Задача «${task.title}» создана`, 'success');
      registerUndo({
        label: `Создана задача «${task.title}»`,
        successMessage: `Задача «${task.title}» удалена`,
        undo: async () => {
          await fetch(`/api/projects/${projectId}/tasks/${task.id}`, { method: 'DELETE' });
          await loadTasks();
        }
      });
      await loadTasks();
    },
    [loadTasks, projectId, registerUndo, selectedIteration]
  );

  const handleTransition = useCallback(
    async (taskId: string, toStatus: TaskStatus) => {
      const current = items.find((task) => task.id === taskId);
      if (!current || current.status === toStatus) {
        return;
      }
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
        toast(`Задача «${current.title}» → ${toStatus}`, 'success');
        registerUndo({
          label: `Статус задачи «${current.title}» изменён`,
          successMessage: `Статус задачи «${current.title}» восстановлен`,
          undo: async () => {
            await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: current.status })
            });
            await loadTasks();
          }
        });
        await loadTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      }
    },
    [items, loadTasks, projectId, registerUndo]
  );

  const handleViewChange = useCallback(
    (next: BoardView) => {
      setView(next);
      syncViewToQuery(next);
    },
    [syncViewToQuery]
  );

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedTaskIds(new Set(items.map((task) => task.id)));
  }, [items]);

  const handleBulkStatusChange = useCallback(
    async (nextStatus: TaskStatus) => {
      if (selectedTaskIds.size === 0) {
        return;
      }
      setBulkUpdating(true);
      try {
        const ids = Array.from(selectedTaskIds);
        const snapshot = items
          .filter((task) => selectedTaskIds.has(task.id))
          .map((task) => ({ id: task.id, title: task.title, status: task.status }));
        const response = await fetch(`/api/projects/${projectId}/tasks/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ operation: 'set_status', taskIds: ids, status: nextStatus })
        });
        if (!response.ok) {
          throw new Error('Не удалось обновить статусы');
        }
        toast(`Статусы обновлены для ${ids.length} задач`, 'success');
        registerUndo({
          label: `Изменён статус ${ids.length} задач`,
          successMessage: 'Массовое изменение статусов отменено',
          undo: async () => {
            await Promise.all(
              snapshot.map((task) =>
                fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ status: task.status })
                })
              )
            );
            await loadTasks();
          }
        });
        setSelectedTaskIds(new Set());
        await loadTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setBulkUpdating(false);
      }
    },
    [items, loadTasks, projectId, registerUndo, selectedTaskIds]
  );

  const handleBulkIterationChange = useCallback(
    async (iterationId: string | null) => {
      if (selectedTaskIds.size === 0) {
        return;
      }
      setBulkUpdating(true);
      try {
        const ids = Array.from(selectedTaskIds);
        const snapshot = items
          .filter((task) => selectedTaskIds.has(task.id))
          .map((task) => ({ id: task.id, iterationId: task.iterationId ?? null }));
        const response = await fetch(`/api/projects/${projectId}/tasks/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ operation: 'set_iteration', taskIds: ids, iterationId })
        });
        if (!response.ok) {
          throw new Error('Не удалось обновить итерацию');
        }
        toast(`Итерация обновлена для ${ids.length} задач`, 'success');
        registerUndo({
          label: `Изменена итерация ${ids.length} задач`,
          successMessage: 'Массовое изменение итераций отменено',
          undo: async () => {
            await Promise.all(
              snapshot.map((task) =>
                fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ iterationId: task.iterationId })
                })
              )
            );
            await loadTasks();
          }
        });
        setSelectedTaskIds(new Set());
        await loadTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setBulkUpdating(false);
      }
    },
    [items, loadTasks, projectId, registerUndo, selectedTaskIds]
  );

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
      } else if (firstStatus) {
        const fallback = map.get(firstStatus);
        if (fallback) {
          fallback.push(task);
        }
      }
    }
    return statuses.map((status) => ({ status, tasks: map.get(status) ?? [] }));
  }, [items, statuses]);

  const activeTask = useMemo(() => {
    if (!activeTaskId) {
      return null;
    }
    return items.find((task) => task.id === activeTaskId) ?? null;
  }, [activeTaskId, items]);

  const isDndActive = viewsEnabled && view === 'kanban';

  const renderStatusControls = useCallback(
    (task: TaskItem) => {
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
              onClick={() => void handleTransition(task.id, status)}
              className="rounded-lg border border-neutral-800 px-3 py-1 text-xs text-neutral-300 transition hover:border-indigo-400 hover:text-white"
            >
              → {status}
            </button>
          ))}
        </div>
      );
    },
    [handleTransition, statuses]
  );

  const handleTaskClick = (taskId: string) => {
    setActiveTaskId(taskId);
    setDrawerOpen(true);
  };

  const handleTaskUpdate = useCallback(
    async (taskId: string, payload: TaskUpdatePayload) => {
      const before = items.find((task) => task.id === taskId);
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || 'Не удалось сохранить задачу');
      }
      toast('Задача обновлена', 'success');
      if (before) {
        registerUndo({
          label: `Обновлена задача «${before.title}»`,
          successMessage: 'Изменения по задаче отменены',
          undo: async () => {
            await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                title: before.title,
                description: before.description ?? '',
                status: before.status,
                iterationId: before.iterationId ?? null,
                assigneeId: before.assigneeId ?? null,
                startAt: before.startAt ?? null,
                dueAt: before.dueAt ?? null,
                labels: before.labels ?? [],
                priority: before.priority ?? null
              })
            });
            await loadTasks();
          }
        });
      }
      await loadTasks();
    },
    [items, loadTasks, projectId, registerUndo]
  );

  const handleCreateIteration = useCallback(
    async (payload: IterationPayload) => {
      const response = await fetch(`/api/projects/${projectId}/iterations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || 'Не удалось создать итерацию');
      }
      await loadIterations();
      setIterationModalOpen(false);
    },
    [loadIterations, projectId]
  );
  return (
    <ProjectPageFrame
      slug="tasks"
      title={projectTitle}
      actions={
        <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-1 text-xs text-neutral-300">
          {availableViews.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleViewChange(option)}
              className={`rounded-lg px-3 py-1 font-medium capitalize transition ${
                view === option ? 'bg-indigo-500 text-white' : 'hover:text-white'
              }`}
            >
              {option === 'kanban'
                ? 'Канбан'
                : option === 'list'
                  ? 'Список'
                  : option === 'calendar'
                    ? 'Календарь'
                    : option === 'gantt'
                      ? 'Гантт'
                      : 'Бэклог'}
            </button>
          ))}
        </div>
      }
      filters={
        <div className="flex flex-wrap gap-2">
          <input
            className="min-w-[200px] flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Поиск по задачам"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'all')}
            disabled={view === 'backlog'}
          >
            <option value="all">Все статусы</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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
          <input
            className="w-40 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Метки"
            value={labelsFilter}
            onChange={(event) => setLabelsFilter(event.target.value)}
          />
          <input
            className="w-36 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Исполнитель"
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setIterationModalOpen(true)}
            className="rounded-xl border border-dashed border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-indigo-400 hover:text-white"
          >
            + Итерация
          </button>
          <button
            type="button"
            onClick={() => setNewTaskModalOpen(true)}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Новая задача
          </button>
          <button
            type="button"
            onClick={() => void refreshAll()}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-300 transition hover:border-indigo-400 hover:text-white"
          >
            Обновить
          </button>
        </div>
      }
      contentClassName="space-y-6"
    >
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {selectedTaskIds.size > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4 text-xs text-indigo-100">
          <span className="font-semibold">Выбрано задач: {selectedTaskIds.size}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllVisible}
              className="rounded-lg border border-indigo-400/60 px-3 py-1 text-indigo-100 transition hover:bg-indigo-500/20"
              disabled={isBulkUpdating}
            >
              Все на странице
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg border border-indigo-400/60 px-3 py-1 text-indigo-100 transition hover:bg-indigo-500/20"
              disabled={isBulkUpdating}
            >
              Снять выбор
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-indigo-400/60 bg-transparent px-2 py-1 text-indigo-100 focus:border-indigo-300 focus:outline-none"
              value={bulkStatusTarget}
              onChange={(event) => setBulkStatusTarget(event.target.value as TaskStatus)}
            >
              {statuses.map((status) => (
                <option key={status} value={status} className="text-neutral-900">
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void handleBulkStatusChange(bulkStatusTarget)}
              className="rounded-lg bg-indigo-500 px-3 py-1 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              disabled={isBulkUpdating}
            >
              Применить статус
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-indigo-400/60 bg-transparent px-2 py-1 text-indigo-100 focus:border-indigo-300 focus:outline-none"
              value={bulkIterationTarget}
              onChange={(event) => setBulkIterationTarget(event.target.value as 'none' | string)}
            >
              <option value="none" className="text-neutral-900">
                Без изменений
              </option>
              <option value="" className="text-neutral-900">
                Без итерации
              </option>
              {iterations.map((iter) => (
                <option key={iter.id} value={iter.id} className="text-neutral-900">
                  {iter.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                void handleBulkIterationChange(
                  bulkIterationTarget === 'none' ? null : bulkIterationTarget === '' ? null : bulkIterationTarget
                )
              }
              className="rounded-lg bg-indigo-500 px-3 py-1 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              disabled={isBulkUpdating}
            >
              Применить итерацию
            </button>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-400">Загрузка…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
            Пока нет задач. Добавьте первую, чтобы начать работу.
          </div>
        ) : view === 'kanban' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {grouped.map((column) => (
              <div
                key={column.status}
                className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4"
                onDragOver={(event) => {
                  if (!isDndActive) {
                    return;
                  }
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(event) => {
                  if (!isDndActive) {
                    return;
                  }
                  event.preventDefault();
                  const taskId = event.dataTransfer.getData('text/plain');
                  if (taskId) {
                    void handleTransition(taskId, column.status);
                  }
                }}
              >
                <div>
                  <p className="text-sm font-semibold capitalize text-white">{column.status.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-neutral-500">{column.tasks.length} задач</p>
                </div>
                <div className="space-y-3">
                  {column.tasks.map((task) => {
                    const isSelected = selectedTaskIds.has(task.id);
                    return (
                      <article
                        key={task.id}
                        draggable={isDndActive}
                      onDragStart={(event) => {
                        if (!isDndActive) {
                          return;
                        }
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', task.id);
                      }}
                      onClick={() => handleTaskClick(task.id)}
                      className={`space-y-2 rounded-xl border p-3 transition hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 ${
                        isSelected ? 'border-indigo-400 bg-indigo-500/10' : 'border-neutral-800 bg-neutral-900/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 cursor-pointer accent-indigo-500"
                          checked={isSelected}
                          onChange={(event) => {
                            event.stopPropagation();
                            toggleTaskSelection(task.id);
                          }}
                        />
                      </div>
                        {task.iterationId ? (
                          <span className="block text-[10px] uppercase tracking-[0.2em] text-indigo-300">
                            {iterationNames.get(task.iterationId) ?? task.iterationId}
                          </span>
                        ) : null}
                        {renderStatusControls(task)}
                      </article>
                    );
                  })}
                  {column.tasks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-neutral-800 p-3 text-xs text-neutral-500">Нет задач</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : view === 'list' ? (
          <ul className="space-y-3">
            {items.map((task) => {
              const isSelected = selectedTaskIds.has(task.id);
              return (
                <li
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className={`space-y-2 rounded-2xl border p-4 transition hover:border-indigo-400 ${
                    isSelected ? 'border-indigo-400 bg-indigo-500/10' : 'border-neutral-800 bg-neutral-950/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 cursor-pointer accent-indigo-500"
                        checked={isSelected}
                        onChange={(event) => {
                          event.stopPropagation();
                          toggleTaskSelection(task.id);
                        }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">{task.title}</div>
                        <div className="text-xs uppercase tracking-[0.2em] text-indigo-300">{task.status}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      {task.priority ? <span className="rounded-lg border border-neutral-800 px-2 py-1">Приоритет: {task.priority}</span> : null}
                      {task.iterationId ? (
                        <span className="rounded-lg border border-neutral-800 px-2 py-1 text-neutral-400">
                          Итерация: {iterationNames.get(task.iterationId) ?? task.iterationId}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {renderStatusControls(task)}
                </li>
              );
            })}
          </ul>
        ) : view === 'calendar' ? (
          <CalendarView tasks={items} />
        ) : view === 'backlog' ? (
          <BacklogView tasks={items} iterations={iterations} onSelect={handleTaskClick} onToggleSelection={toggleTaskSelection} selectedTaskIds={selectedTaskIds} />
        ) : (
          <GanttView tasks={items} />
        )}
      </section>

      <TaskDrawer
        open={drawerOpen && Boolean(activeTask)}
        task={activeTask}
        statuses={statuses}
        iterations={iterations}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleTaskUpdate}
      />

      <NewTaskModal
        open={newTaskModalOpen}
        statuses={statuses}
        iterations={iterations}
        onClose={() => setNewTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <IterationModal
        open={iterationModalOpen}
        onClose={() => setIterationModalOpen(false)}
        onSubmit={handleCreateIteration}
      />
    </ProjectPageFrame>
  );
}
type TaskDrawerProps = {
  open: boolean;
  task: TaskItem | null;
  statuses: TaskStatus[];
  iterations: IterationItem[];
  onClose: () => void;
  onSubmit: (taskId: string, payload: TaskUpdatePayload) => Promise<void>;
};


type TaskDrawerTab = 'comments' | 'files' | 'history' | 'hints';

type CommentEntry = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

function TaskDrawer({ open, task, statuses, iterations, onClose, onSubmit }: TaskDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('new');
  const [iterationId, setIterationId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med');
  const [startAt, setStartAt] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [labels, setLabels] = useState('');
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [activeTab, setActiveTab] = useState<TaskDrawerTab>('comments');
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !task) {
      return;
    }
    setTitle(task.title ?? '');
    setDescription(task.description ?? '');
    setStatus(task.status ?? 'new');
    setIterationId(task.iterationId ?? '');
    setAssigneeId(task.assigneeId ?? '');
    setPriority(task.priority ?? 'med');
    setStartAt(toInputDateTime(task.startAt));
    setDueAt(toInputDateTime(task.dueAt));
    setLabels(Array.isArray(task.labels) ? task.labels.join(', ') : '');
    setComments([
      {
        id: `${task.id}-c1`,
        author: 'Мария Петрова',
        message: 'Проверьте критерии готовности перед переводом задачи в ревью.',
        createdAt: new Date().toISOString()
      },
      {
        id: `${task.id}-c2`,
        author: 'Алексей Ким',
        message: 'На созвоне обсуждали, что дедлайн можно сдвинуть на два дня.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      }
    ]);
    setCommentDraft('');
    setActiveTab('comments');
    setError(null);
  }, [open, task]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose();
    }
  }, [isSaving, onClose]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!task) {
        return;
      }
      setSaving(true);
      setError(null);
      try {
        const payload: TaskUpdatePayload = {};
        if (title.trim() && title.trim() !== task.title) {
          payload.title = title.trim();
        }
        if (description !== (task.description ?? '')) {
          payload.description = description ? description : '';
        }
        if (status && status !== task.status) {
          payload.status = status;
        }
        if (iterationId !== (task.iterationId ?? '')) {
          payload.iterationId = iterationId ? iterationId : null;
        }
        if (assigneeId !== (task.assigneeId ?? '')) {
          payload.assigneeId = assigneeId ? assigneeId : null;
        }
        if (priority !== (task.priority ?? 'med')) {
          payload.priority = priority;
        }
        const nextStart = fromInputDate(startAt);
        if (nextStart !== (task.startAt ?? null)) {
          payload.startAt = nextStart;
        }
        const nextDue = fromInputDate(dueAt);
        if (nextDue !== (task.dueAt ?? null)) {
          payload.dueAt = nextDue;
        }
        const parsedLabels = labels
          .split(',')
          .map((label) => label.trim())
          .filter((label) => label.length > 0);
        const currentLabels = Array.isArray(task.labels) ? task.labels : [];
        if (parsedLabels.join('|') !== currentLabels.join('|')) {
          payload.labels = parsedLabels;
        }

        if (Object.keys(payload).length === 0) {
          setError('Изменений не обнаружено');
          setSaving(false);
          return;
        }

        await onSubmit(task.id, payload);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось сохранить изменения');
      } finally {
        setSaving(false);
      }
    },
    [assigneeId, description, dueAt, iterationId, labels, onSubmit, priority, startAt, status, task, title]
  );

  const handleCommentSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!commentDraft.trim() || !task) {
        setError('Введите текст комментария');
        return;
      }
      const entry: CommentEntry = {
        id: `${task.id}-${Date.now()}`,
        author: 'Вы',
        message: commentDraft.trim(),
        createdAt: new Date().toISOString()
      };
      setComments((prev) => [entry, ...prev]);
      setCommentDraft('');
      setError(null);
      toast('Комментарий добавлен', 'success');
    },
    [commentDraft, task]
  );

  const files = useMemo(
    () => [
      { id: 'spec', name: 'Product-spec.pdf', size: '1.2 МБ' },
      { id: 'brief', name: 'Design-brief.md', size: '8 КБ' }
    ],
    []
  );

  const historyItems = useMemo(() => {
    if (!task) {
      return [] as { id: string; title: string; ts: string }[];
    }
    return [
      { id: 'created', title: 'Задача создана', ts: task.createdAt },
      { id: 'updated', title: 'Последнее обновление', ts: task.updatedAt },
      { id: 'status', title: `Статус: ${task.status}`, ts: new Date().toISOString() }
    ];
  }, [task]);

  const hints = useMemo(
    () => [
      {
        id: 'hint-1',
        title: 'Проверьте дедлайн',
        description: 'Синхронизируйтесь с командой, чтобы подтвердить актуальные сроки выполнения задачи.'
      },
      {
        id: 'hint-2',
        title: 'Добавьте чек-лист',
        description: 'Разбейте задачу на подзадачи, чтобы ускорить ревью и приёмку.'
      }
    ],
    []
  );

  return (
    <Sheet open={open} onOpenChange={(value) => (!value ? handleClose() : undefined)}>
      <SheetContent className="flex w-full flex-col gap-4 overflow-hidden sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-white">Карточка задачи</SheetTitle>
        </SheetHeader>
        {task ? (
          <div className="flex h-full flex-col gap-4 overflow-hidden">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="space-y-2 text-sm text-neutral-200">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Название</span>
                <input
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm text-neutral-200">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Описание</span>
                <textarea
                  className="min-h-[120px] w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Markdown или обычный текст"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-neutral-200">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Статус</span>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as TaskStatus)}
                  >
                    {statuses.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-neutral-200">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Приоритет</span>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as 'low' | 'med' | 'high')}
                  >
                    <option value="low">Низкий</option>
                    <option value="med">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-neutral-200">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Итерация</span>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    value={iterationId}
                    onChange={(event) => setIterationId(event.target.value)}
                  >
                    <option value="">Без итерации</option>
                    {iterations.map((iter) => (
                      <option key={iter.id} value={iter.id}>
                        {iter.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-neutral-200">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Исполнитель</span>
                  <input
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    value={assigneeId}
                    onChange={(event) => setAssigneeId(event.target.value)}
                    placeholder="user_id"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-neutral-200">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Начало</span>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    value={startAt}
                    onChange={(event) => setStartAt(event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm text-neutral-200">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Дедлайн</span>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    value={dueAt}
                    onChange={(event) => setDueAt(event.target.value)}
                  />
                </label>
              </div>
              <label className="space-y-2 text-sm text-neutral-200">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Метки</span>
                <input
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  value={labels}
                  onChange={(event) => setLabels(event.target.value)}
                  placeholder="product, design, urgent"
                />
              </label>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <div className="flex justify-between gap-3 border-t border-neutral-800 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-indigo-400 hover:text-white"
                  disabled={isSaving}
                >
                  Закрыть
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
                  disabled={isSaving}
                >
                  {isSaving ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            </form>
            <div className="flex flex-1 flex-col gap-3 overflow-hidden">
              <nav className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-1 text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                {([
                  { id: 'comments', label: 'Комментарии' },
                  { id: 'files', label: 'Файлы' },
                  { id: 'history', label: 'История' },
                  { id: 'hints', label: 'Подсказки' }
                ] as { id: TaskDrawerTab; label: string }[]).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'rounded-lg px-3 py-1 font-semibold transition',
                      activeTab === tab.id ? 'bg-indigo-500 text-white' : 'hover:text-white'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div className="flex-1 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm text-neutral-200">
                {activeTab === 'comments' ? (
                  <div className="space-y-4">
                    <ul className="space-y-3">
                      {comments.map((comment) => (
                        <li key={comment.id} className="space-y-1 rounded-lg border border-neutral-800 bg-neutral-900/80 p-3">
                          <div className="flex items-center justify-between text-xs text-neutral-400">
                            <span className="font-semibold text-white">{comment.author}</span>
                            <time>{new Date(comment.createdAt).toLocaleString('ru-RU')}</time>
                          </div>
                          <p className="text-sm text-neutral-200">{comment.message}</p>
                        </li>
                      ))}
                      {comments.length === 0 ? <li className="text-xs text-neutral-500">Комментариев пока нет</li> : null}
                    </ul>
                    <form className="space-y-2" onSubmit={handleCommentSubmit}>
                      <textarea
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        value={commentDraft}
                        onChange={(event) => setCommentDraft(event.target.value)}
                        placeholder="Оставьте заметку для команды"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-indigo-400"
                        >
                          Добавить комментарий
                        </button>
                      </div>
                    </form>
                  </div>
                ) : activeTab === 'files' ? (
                  <ul className="space-y-2">
                    {files.map((file) => (
                      <li key={file.id} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2">
                        <div>
                          <p className="font-semibold text-white">{file.name}</p>
                          <p className="text-xs text-neutral-500">{file.size}</p>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg border border-neutral-700 px-3 py-1 text-xs text-neutral-300 transition hover:border-indigo-400 hover:text-white"
                          onClick={() => toast(`Файл ${file.name} отправлен на скачивание`, 'info')}
                        >
                          Скачать
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : activeTab === 'history' ? (
                  <ul className="space-y-2 text-xs text-neutral-400">
                    {historyItems.map((item) => (
                      <li key={item.id} className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2">
                        <p className="font-semibold text-white">{item.title}</p>
                        <time className="block text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                          {new Date(item.ts).toLocaleString('ru-RU')}
                        </time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-3 text-sm text-neutral-200">
                    {hints.map((hint) => (
                      <li key={hint.id} className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2">
                        <p className="font-semibold text-white">{hint.title}</p>
                        <p className="text-xs text-neutral-400">{hint.description}</p>
                        <button
                          type="button"
                          className="rounded-lg border border-neutral-700 px-3 py-1 text-xs text-neutral-300 transition hover:border-indigo-400 hover:text-white"
                          onClick={() => toast('Подсказка отмечена', 'info')}
                        >
                          Готово
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">Задача не выбрана</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
type IterationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: IterationPayload) => Promise<void>;
};

type NewTaskModalProps = {
  open: boolean;
  statuses: TaskStatus[];
  iterations: IterationItem[];
  onClose: () => void;
  onSubmit: (payload: TaskCreateModalPayload) => Promise<void>;
};

function NewTaskModal({ open, statuses, iterations, onClose, onSubmit }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('new');
  const [iterationId, setIterationId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [labels, setLabels] = useState('');
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setStatus(statuses[0] ?? 'new');
      setIterationId('');
      setAssigneeId('');
      setStartAt('');
      setDueAt('');
      setLabels('');
      setPriority('med');
      setError(null);
    }
  }, [open, statuses]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Введите название задачи');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: TaskCreateModalPayload = {
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        status,
        iterationId: iterationId || undefined,
        assigneeId: assigneeId.trim() || undefined,
        startAt: fromInputDate(startAt),
        dueAt: fromInputDate(dueAt),
        labels: labels
          .split(',')
          .map((label) => label.trim())
          .filter(Boolean),
        priority
      };
      if (!payload.labels?.length) {
        delete payload.labels;
      }
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать задачу');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 backdrop-blur-sm">
      <form className="w-full max-w-2xl space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/95 p-6" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Новая задача</h2>
            <p className="text-xs text-neutral-400">Заполните ключевые поля и выберите подходящий статус.</p>
          </div>
          <button
            type="button"
            onClick={() => (!isSaving ? onClose() : undefined)}
            className="rounded-xl border border-neutral-700 px-3 py-1 text-xs text-neutral-300 transition hover:border-indigo-400 hover:text-white"
            disabled={isSaving}
          >
            Закрыть
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-neutral-200 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Название</span>
            <input
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например: Подготовить презентацию"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-200 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Описание</span>
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Кратко опишите цель задачи"
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-200">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Статус</span>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-neutral-200">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Итерация</span>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={iterationId}
              onChange={(event) => setIterationId(event.target.value)}
            >
              <option value="">Без итерации</option>
              {iterations.map((iter) => (
                <option key={iter.id} value={iter.id}>
                  {iter.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-neutral-200">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Исполнитель</span>
            <input
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              placeholder="user_id"
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-200">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Приоритет</span>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={priority}
              onChange={(event) => setPriority(event.target.value as 'low' | 'med' | 'high')}
            >
              <option value="low">Низкий</option>
              <option value="med">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-neutral-200">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Начало</span>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-200">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Дедлайн</span>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-200 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Метки</span>
            <input
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={labels}
              onChange={(event) => setLabels(event.target.value)}
              placeholder="product, design, urgent"
            />
          </label>
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => (!isSaving ? onClose() : undefined)}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-indigo-400 hover:text-white"
            disabled={isSaving}
          >
            Отменить
          </button>
          <button
            type="submit"
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? 'Создание…' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  );
}

function IterationModal({ open, onClose, onSubmit }: IterationModalProps) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setStart('');
      setEnd('');
      setError(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: IterationPayload = {};
      if (title.trim()) {
        payload.title = title.trim();
      }
      const startIso = fromInputDate(start);
      if (startIso) {
        payload.start = startIso;
      }
      const endIso = fromInputDate(end);
      if (endIso) {
        payload.end = endIso;
      }
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать итерацию');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-950/70 backdrop-blur-sm">
      <form className="w-full max-w-md space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/95 p-6" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold text-white">Новая итерация</h2>
        <label className="space-y-2 text-sm text-neutral-200">
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Название</span>
          <input
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Итерация Q2"
            required
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-neutral-200">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Начало</span>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm text-neutral-200">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Окончание</span>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </label>
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <div className="flex justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => (!isSaving ? onClose() : undefined)}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-indigo-400 hover:text-white"
            disabled={isSaving}
          >
            Отменить
          </button>
          <button
            type="submit"
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? 'Создание…' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  );
}
type TimelineTask = Pick<TaskItem, 'id' | 'title' | 'status' | 'startAt' | 'dueAt'>;

type CalendarViewProps = {
  tasks: TimelineTask[];
};

type BacklogViewProps = {
  tasks: TaskItem[];
  iterations: IterationItem[];
  selectedTaskIds: Set<string>;
  onSelect: (taskId: string) => void;
  onToggleSelection: (taskId: string) => void;
};

function BacklogView({ tasks, iterations, selectedTaskIds, onSelect, onToggleSelection }: BacklogViewProps) {
  const iterationTitles = useMemo(() => {
    const map = new Map<string, string>();
    iterations.forEach((iter) => map.set(iter.id, iter.title));
    return map;
  }, [iterations]);

  const groups = useMemo(() => {
    const bucket = new Map<string | null, TaskItem[]>();
    for (const task of tasks) {
      const key = task.iterationId ?? null;
      const list = bucket.get(key) ?? [];
      list.push(task);
      bucket.set(key, list);
    }
    const entries = Array.from(bucket.entries());
    entries.sort((a, b) => {
      if (a[0] === b[0]) {
        return 0;
      }
      if (a[0] === null) {
        return -1;
      }
      if (b[0] === null) {
        return 1;
      }
      return (iterationTitles.get(a[0]!) ?? a[0]!).localeCompare(iterationTitles.get(b[0]!) ?? b[0]!);
    });
    return entries.map(([iterationId, bucketTasks]) => ({
      iterationId,
      title: iterationId ? iterationTitles.get(iterationId) ?? iterationId : 'Без итерации',
      tasks: bucketTasks.sort((a, b) => a.title.localeCompare(b.title))
    }));
  }, [iterationTitles, tasks]);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
        Бэклог пуст. Добавьте задачи, чтобы начать планирование.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.iterationId ?? 'none'} className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">{group.title}</h3>
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">{group.tasks.length} задач</span>
          </div>
          <ul className="space-y-2">
            {group.tasks.map((task) => {
              const isSelected = selectedTaskIds.has(task.id);
              return (
                <li
                  key={task.id}
                  onClick={() => onSelect(task.id)}
                  className={`rounded-xl border p-3 transition hover:border-indigo-400 ${
                    isSelected ? 'border-indigo-400 bg-indigo-500/10' : 'border-neutral-800 bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 cursor-pointer accent-indigo-500"
                        checked={isSelected}
                        onChange={(event) => {
                          event.stopPropagation();
                          onToggleSelection(task.id);
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{task.title}</p>
                        {task.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{task.description}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-200">{task.status}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function CalendarView({ tasks }: CalendarViewProps) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days: { date: Date; key: string; currentMonth: boolean }[] = [];
  let cursor = new Date(calendarStart);
  while (cursor <= calendarEnd) {
    const day = new Date(cursor);
    days.push({ date: day, key: formatDateKey(day), currentMonth: day.getMonth() === monthStart.getMonth() });
    cursor = addDays(cursor, 1);
  }

  const tasksByDay = new Map<string, TimelineTask[]>();
  for (const task of tasks) {
    const start = parseISODate(task.startAt ?? task.dueAt);
    const end = parseISODate(task.dueAt ?? task.startAt ?? task.dueAt);
    if (!start && !end) {
      continue;
    }
    const rangeStart = start ?? end;
    const rangeEnd = end ?? start ?? rangeStart;
    if (!rangeStart || !rangeEnd) {
      continue;
    }
    let dayCursor = new Date(rangeStart);
    dayCursor.setHours(0, 0, 0, 0);
    const finalDay = new Date(rangeEnd);
    finalDay.setHours(0, 0, 0, 0);
    while (dayCursor <= finalDay) {
      const key = formatDateKey(dayCursor);
      if (!tasksByDay.has(key)) {
        tasksByDay.set(key, []);
      }
      tasksByDay.get(key)?.push(task);
      dayCursor = addDays(dayCursor, 1);
    }
  }

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize text-white">{monthFormatter.format(monthStart)}</h3>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Календарный обзор</p>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs text-neutral-500">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayTasks = tasksByDay.get(day.key) ?? [];
          return (
            <div
              key={day.key}
              className={`min-h-[120px] rounded-xl border border-neutral-800 bg-neutral-950/70 p-2 text-xs transition ${
                day.currentMonth ? 'text-neutral-200' : 'text-neutral-500 opacity-60'
              }`}
            >
              <p className="text-right text-[11px] font-semibold">{day.date.getDate()}</p>
              <div className="mt-2 space-y-1">
                {dayTasks.map((task) => (
                  <div key={task.id} className="rounded-lg bg-indigo-500/20 p-2 text-[11px] text-indigo-100">
                    <p className="font-semibold leading-tight text-white">{task.title}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-200">{task.status}</p>
                  </div>
                ))}
                {dayTasks.length === 0 ? <p className="text-[10px] text-neutral-600">Нет задач</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type GanttViewProps = {
  tasks: TimelineTask[];
};

function GanttView({ tasks }: GanttViewProps) {
  const dates = tasks.reduce(
    (acc, task) => {
      const start = parseISODate(task.startAt ?? task.dueAt);
      const end = parseISODate(task.dueAt ?? task.startAt ?? task.dueAt);
      if (start && (!acc.min || start < acc.min)) {
        acc.min = start;
      }
      if (end && (!acc.max || end > acc.max)) {
        acc.max = end;
      }
      return acc;
    },
    { min: null as Date | null, max: null as Date | null }
  );

  const today = new Date();
  const start = startOfWeek(dates.min ?? today);
  const end = endOfWeek(dates.max ?? addDays(today, 21));

  const weeks: Date[] = [];
  let cursor = new Date(start);
  while (cursor <= end && weeks.length < 16) {
    weeks.push(new Date(cursor));
    cursor = addDays(cursor, 7);
  }
  if (weeks.length === 0) {
    weeks.push(new Date(start));
  }

  const headerFormatter = useMemo(
    () => new Intl.DateTimeFormat('ru-RU', { month: 'short', day: 'numeric' }),
    []
  );

  const gridStyle = useMemo(() => ({ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }), [weeks.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Гантт</h3>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Обзор по неделям</p>
      </div>
      <div className="grid grid-cols-[220px_1fr] gap-4">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Задачи</div>
        <div className="overflow-hidden rounded-xl border border-neutral-800">
          <div className="grid text-xs text-neutral-400" style={gridStyle}>
            {weeks.map((week) => (
              <div key={week.toISOString()} className="border-l border-neutral-800 bg-neutral-900/60 px-2 py-1 first:border-l-0">
                {headerFormatter.format(week)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[220px_1fr] gap-4">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-white">
              <p className="font-semibold leading-tight">{task.title}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-200">{task.status}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {tasks.map((task) => {
            const startDate = parseISODate(task.startAt ?? task.dueAt);
            const endDate = parseISODate(task.dueAt ?? task.startAt ?? task.dueAt);
            const hasDates = Boolean(startDate || endDate);
            const rangeStart = startDate ?? endDate ?? start;
            const rangeEnd = endDate ?? startDate ?? rangeStart;
            const startIndex = Math.max(0, Math.floor((rangeStart.getTime() - start.getTime()) / WEEK_MS));
            const endIndex = Math.max(startIndex, Math.floor((rangeEnd.getTime() - start.getTime()) / WEEK_MS));
            const gridColumnStart = startIndex + 1;
            const gridColumnEnd = Math.min(weeks.length + 1, endIndex + 2);
            return (
              <div key={task.id} className="grid" style={gridStyle}>
                <div
                  className={`relative h-9 rounded-full border border-indigo-500/50 bg-indigo-500/20 ${
                    hasDates ? '' : 'opacity-60'
                  }`}
                  style={{ gridColumnStart, gridColumnEnd }}
                >
                  <div className="absolute inset-1 rounded-full bg-indigo-500/30" />
                  {!hasDates ? (
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] text-neutral-300">
                      Даты не указаны
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
