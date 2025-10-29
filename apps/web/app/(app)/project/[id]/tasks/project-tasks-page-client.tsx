'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AuditLogEntry } from '@collabverse/api';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import type { Iteration, ProjectWorkflow, Task, TaskStatus } from '@/domain/projects/types';
import { flags } from '@/lib/flags';

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
  | 'estimatedTime'
  | 'loggedTime'
>;

type IterationItem = Pick<Iteration, 'id' | 'title'>;

type BoardView = 'list' | 'kanban' | 'calendar' | 'gantt' | 'activity';

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
};

type IterationPayload = {
  title?: string;
  start?: string;
  end?: string;
};

const DEFAULT_STATUSES: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const TASK_ACTIVITY_LABELS: Record<string, string> = {
  'task.created': 'Создана задача',
  'task.updated': 'Обновлена задача',
  'task.status_changed': 'Изменён статус задачи',
  'task.time_updated': 'Обновлено время',
  'file.attached': 'Прикреплён файл',
  'project.updated': 'Изменения в проекте'
};

const activityDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
});

function getViewLabel(view: BoardView): string {
  switch (view) {
    case 'kanban':
      return 'Канбан';
    case 'calendar':
      return 'Календарь';
    case 'gantt':
      return 'Гантт';
    case 'activity':
      return 'Активность';
    case 'list':
    default:
      return 'Список';
  }
}

function getTaskActivityLabel(action: string): string {
  return TASK_ACTIVITY_LABELS[action] ?? action;
}

function describeTaskActivity(entry: AuditLogEntry): string {
  const { entity } = entry;
  if (!entity) {
    return '';
  }
  if (entity.type === 'task') {
    return `Задача #${entity.id}`;
  }
  if (entity.type === 'file') {
    return `Файл #${entity.id}`;
  }
  if (entity.type === 'project') {
    return `Проект #${entity.id}`;
  }
  return `${entity.type} #${entity.id}`;
}

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
    const base: BoardView[] = ['list', 'kanban'];
    if (viewsEnabled) {
      base.push('calendar', 'gantt');
    }
    if (flags.PROJECT_ACTIVITY_AUDIT) {
      base.push('activity');
    }
    return base;
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
  const [title, setTitle] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [iterationModalOpen, setIterationModalOpen] = useState(false);

  useEffect(() => {
    if (!availableViews.includes(view) && availableViews.length > 0) {
      setView(availableViews[0] as BoardView);
    }
  }, [availableViews, view]);

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

  const handleTransition = useCallback(
    async (taskId: string, toStatus: TaskStatus) => {
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
    },
    [loadTasks, projectId]
  );

  const handleViewChange = useCallback(
    (next: BoardView) => {
      setView(next);
      syncViewToQuery(next);
    },
    [syncViewToQuery]
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
      await loadTasks();
    },
    [loadTasks, projectId]
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
              {getViewLabel(option)}
            </button>
          ))}
        </div>
      }
      filters={
        <>
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
            onClick={() => setIterationModalOpen(true)}
            className="rounded-xl border border-dashed border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-indigo-400 hover:text-white"
          >
            + Итерация
          </button>
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
        </>
      }
      contentClassName="space-y-6"
    >
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <section className="space-y-3">
        {view === 'activity' ? (
          <TaskActivityView projectId={projectId} />
        ) : isLoading ? (
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
                  {column.tasks.map((task) => (
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
                      className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 transition hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10"
                    >
                      <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                      {task.iterationId ? (
                        <span className="block text-[10px] uppercase tracking-[0.2em] text-indigo-300">
                          {iterationNames.get(task.iterationId) ?? task.iterationId}
                        </span>
                      ) : null}
                      {renderStatusControls(task)}
                    </article>
                  ))}
                  {column.tasks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-neutral-800 p-3 text-xs text-neutral-500">Нет задач</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : view === 'list' ? (
          <ul className="space-y-3">
            {items.map((task) => (
              <li
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 transition hover:border-indigo-400"
              >
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
        ) : view === 'calendar' ? (
          <CalendarView tasks={items} />
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
        projectId={projectId}
        onRefresh={refreshAll}
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
  projectId: string;
  onRefresh: () => Promise<void>;
};

function TaskDrawer({ open, task, statuses, iterations, onClose, onSubmit, projectId, onRefresh }: TaskDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [iterationId, setIterationId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [labels, setLabels] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedInput, setEstimatedInput] = useState('');
  const [loggedTotal, setLoggedTotal] = useState(0);
  const [loggedIncrement, setLoggedIncrement] = useState('');
  const [timeError, setTimeError] = useState<string | null>(null);
  const [timeSaving, setTimeSaving] = useState(false);
  const [timeMessage, setTimeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !task) {
      return;
    }
    setTitle(task.title ?? '');
    setDescription(task.description ?? '');
    setStatus(task.status ?? 'new');
    setIterationId(task.iterationId ?? '');
    setAssigneeId(task.assigneeId ?? '');
    setStartAt(toInputDateTime(task.startAt));
    setDueAt(toInputDateTime(task.dueAt));
    setLabels(Array.isArray(task.labels) ? task.labels.join(', ') : '');
    setError(null);
    setEstimatedInput(
      typeof task.estimatedTime === 'number' && Number.isFinite(task.estimatedTime)
        ? String(task.estimatedTime)
        : ''
    );
    setLoggedTotal(typeof task.loggedTime === 'number' && Number.isFinite(task.loggedTime) ? task.loggedTime : 0);
    setLoggedIncrement('');
    setTimeError(null);
    setTimeMessage(null);
  }, [open, task]);

  const handleEstimatedSave = useCallback(async () => {
    if (!task) {
      return;
    }
    const nextValue = Number.parseInt(estimatedInput, 10);
    if (!Number.isFinite(nextValue) || nextValue < 0) {
      setTimeError('Оценка должна быть неотрицательным числом.');
      return;
    }
    setTimeSaving(true);
    setTimeError(null);
    setTimeMessage(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${task.id}/time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimatedTime: nextValue })
      });
      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || 'Не удалось обновить оценку времени');
      }
      const data = (await response.json()) as { estimatedTime?: number | null; loggedTime?: number | null };
      setEstimatedInput(
        typeof data.estimatedTime === 'number' && Number.isFinite(data.estimatedTime)
          ? String(data.estimatedTime)
          : ''
      );
      if (typeof data.loggedTime === 'number' && Number.isFinite(data.loggedTime)) {
        setLoggedTotal(data.loggedTime);
      }
      setTimeMessage('Оценка обновлена');
      await onRefresh();
    } catch (err) {
      setTimeError(err instanceof Error ? err.message : 'Не удалось обновить оценку времени');
    } finally {
      setTimeSaving(false);
    }
  }, [estimatedInput, onRefresh, projectId, task]);

  const handleLogSubmit = useCallback(async () => {
    if (!task) {
      return;
    }
    const increment = Number.parseInt(loggedIncrement, 10);
    if (!Number.isFinite(increment) || increment <= 0) {
      setTimeError('Введите количество часов для добавления.');
      return;
    }
    setTimeSaving(true);
    setTimeError(null);
    setTimeMessage(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${task.id}/time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment })
      });
      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || 'Не удалось обновить учёт времени');
      }
      const data = (await response.json()) as { estimatedTime?: number | null; loggedTime?: number | null };
      if (typeof data.loggedTime === 'number' && Number.isFinite(data.loggedTime)) {
        setLoggedTotal(data.loggedTime);
      }
      if (typeof data.estimatedTime === 'number' && Number.isFinite(data.estimatedTime)) {
        setEstimatedInput(String(data.estimatedTime));
      }
      setLoggedIncrement('');
      setTimeMessage('Время зафиксировано');
      await onRefresh();
    } catch (err) {
      setTimeError(err instanceof Error ? err.message : 'Не удалось обновить учёт времени');
    } finally {
      setTimeSaving(false);
    }
  }, [loggedIncrement, onRefresh, projectId, task]);

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
          onClose();
          return;
        }

        await onSubmit(task.id, payload);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось сохранить');
      } finally {
        setSaving(false);
      }
    },
    [assigneeId, description, dueAt, iterationId, labels, onClose, onSubmit, startAt, status, task, title]
  );

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? handleClose() : undefined)}>
      <SheetContent className="flex h-full flex-col bg-neutral-950/95" side="right">
        <form className="flex h-full flex-col gap-4 p-6" onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Детали задачи</SheetTitle>
            {task ? <p className="text-xs text-neutral-500">ID: {task.id}</p> : null}
          </SheetHeader>
          {task ? (
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
              <label className="space-y-2 text-sm text-neutral-200">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Название</span>
                <input
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
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
              {flags.TASK_TIME_TRACKING ? (
                <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-neutral-100">Трекинг времени</h3>
                    <span className="text-xs text-neutral-400">Залогировано: {loggedTotal} ч</span>
                  </div>
                  {timeError ? <p className="text-xs text-rose-400">{timeError}</p> : null}
                  {timeMessage ? <p className="text-xs text-emerald-400">{timeMessage}</p> : null}
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto]">
                    <label className="space-y-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
                      <span className="block text-neutral-400">Оценка (ч)</span>
                      <input
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        value={estimatedInput}
                        onChange={(event) => setEstimatedInput(event.target.value.replace(/[^0-9]/g, ''))}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        disabled={timeSaving}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void handleEstimatedSave()}
                      className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-60"
                      disabled={timeSaving}
                    >
                      {timeSaving ? 'Сохранение…' : 'Сохранить'}
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto]">
                    <label className="space-y-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
                      <span className="block text-neutral-400">Добавить (ч)</span>
                      <input
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        value={loggedIncrement}
                        onChange={(event) => setLoggedIncrement(event.target.value.replace(/[^0-9]/g, ''))}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        disabled={timeSaving}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void handleLogSubmit()}
                      className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-indigo-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-60"
                      disabled={timeSaving}
                    >
                      {timeSaving ? 'Сохранение…' : 'Добавить'}
                    </button>
                  </div>
                </div>
              ) : null}
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">Задача не выбрана</div>
          )}
          <div className="flex justify-between gap-3 border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={handleClose}
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
              {isSaving ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

type TaskActivityViewProps = {
  projectId: string;
};

function TaskActivityView({ projectId }: TaskActivityViewProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    if (!flags.PROJECT_ACTIVITY_AUDIT) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/activity?scope=tasks&limit=100`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить активность');
      }
      const data = (await response.json()) as { items?: AuditLogEntry[] };
      setEntries(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки активности');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  if (!flags.PROJECT_ACTIVITY_AUDIT) {
    return (
      <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-6 text-sm text-neutral-400">
        Раздел активности отключён конфигурацией.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-900 bg-neutral-950/80 p-6 text-sm text-neutral-400">
        Загрузка активности задач…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100">{error}</div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-6 text-sm text-neutral-400">
        Активность по задачам появится после первых изменений.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-100">{getTaskActivityLabel(entry.action)}</p>
              <p className="text-xs text-neutral-400">{describeTaskActivity(entry)}</p>
            </div>
            <span className="text-xs text-neutral-500">{activityDateFormatter.format(new Date(entry.createdAt))}</span>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Исполнитель: <span className="text-neutral-200">{entry.actorId}</span>
          </p>
          {entry.action === 'task.time_updated' && typeof entry.after === 'object' && entry.after !== null ? (
            <p className="mt-1 text-xs text-neutral-400">
              Время: {(entry.after as { loggedTime?: unknown }).loggedTime ?? '—'} / {(entry.after as { estimatedTime?: unknown }).estimatedTime ?? '—'} ч
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
type IterationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: IterationPayload) => Promise<void>;
};

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
