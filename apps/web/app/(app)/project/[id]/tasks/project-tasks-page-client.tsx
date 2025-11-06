'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AuditLogEntry } from '@collabverse/api';
import TaskDrawer from '@/components/project/TaskDrawer';
import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import type { Iteration, ProjectWorkflow, Task, TaskStatus, TaskTreeNode } from '@/domain/projects/types';
import { flags } from '@/lib/flags';
import CalendarView from '@/components/project/views/CalendarView';
import TimelineView from '@/components/project/views/TimelineView';
import KanbanView from './components/kanban-view';
import ListView from './components/list-view';

type TaskItem = Pick<
  Task,
  | 'id'
  | 'number'
  | 'title'
  | 'status'
  | 'iterationId'
  | 'description'
  | 'assigneeId'
  | 'startAt'
  | 'startDate'
  | 'dueAt'
  | 'labels'
  | 'estimatedTime'
  | 'storyPoints'
  | 'loggedTime'
  | 'projectId'
  | 'parentId'
  | 'createdAt'
  | 'updatedAt'
>;

type IterationItem = Pick<Iteration, 'id' | 'title'>;

type BoardView = 'list' | 'kanban' | 'calendar' | 'gantt' | 'activity';

type ProjectTasksPageClientProps = {
  projectId: string;
  projectTitle: string;
  projectKey?: string; // Optional project key
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
  startDate?: string | null;
  dueAt?: string | null;
  priority?: 'low' | 'med' | 'high' | 'urgent' | null;
  storyPoints?: number | null;
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

function formatAuditTimeValue(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return '—';
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
  projectKey,
  initialView,
  viewsEnabled = false
}: ProjectTasksPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [projectKeyState, setProjectKeyState] = useState<string>(projectKey ?? 'PROJ');
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
  const [taskTree, setTaskTree] = useState<TaskTreeNode[]>([]); // Tree view for ListView
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

  const loadProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const project = (await response.json()) as { key?: string };
        if (project.key) {
          setProjectKeyState(project.key);
        }
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectKey) {
      void loadProject();
    }
  }, [projectKey, loadProject]);

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
      // Request tree view for ListView
      if (view === 'list') {
        params.set('view', 'tree');
      }
      const query = params.toString();
      const response = await fetch(`/api/projects/${projectId}/tasks${query ? `?${query}` : ''}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить задачи');
      }
      const data = (await response.json()) as { items?: TaskItem[]; tree?: TaskTreeNode[] };
      if (Array.isArray(data.items)) {
        setItems(data.items);
      }
      if (Array.isArray(data.tree)) {
        setTaskTree(data.tree);
      } else if (Array.isArray(data.items)) {
        // Convert flat list to tree if needed
        const taskMap = new Map<string, TaskTreeNode & { children?: TaskTreeNode[] }>();
        const roots: TaskTreeNode[] = [];
        
        for (const task of data.items) {
          taskMap.set(task.id, { ...task, children: [] });
        }
        
        for (const task of data.items) {
          const node = taskMap.get(task.id)!;
          if (task.parentId && taskMap.has(task.parentId)) {
            const parent = taskMap.get(task.parentId)!;
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(node);
          } else {
            roots.push(node);
          }
        }
        setTaskTree(roots);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedIteration, view]);

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

  const handleEventDrop = useCallback(
    async (taskId: string, newStart: Date, newEnd: Date) => {
      try {
        await handleTaskUpdate(taskId, {
          startDate: newStart.toISOString(),
          dueAt: newEnd.toISOString()
        });
      } catch (error) {
        console.error('Failed to update task dates:', error);
      }
    },
    [handleTaskUpdate]
  );

  const handleTaskDateChange = useCallback(
    async (taskId: string, startDate: Date, dueDate: Date) => {
      try {
        await handleTaskUpdate(taskId, {
          startDate: startDate.toISOString(),
          dueAt: dueDate.toISOString()
        });
      } catch (error) {
        console.error('Failed to update task dates:', error);
      }
    },
    [handleTaskUpdate]
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
          <KanbanView
            statuses={statuses}
            tasks={items}
            projectKey={projectKeyState}
            onTaskDrop={handleTransition}
            onTaskClick={handleTaskClick}
            isLoading={isLoading}
          />
        ) : view === 'list' ? (
          <ListView
            tree={taskTree}
            projectKey={projectKeyState}
            onTaskClick={handleTaskClick}
            isLoading={isLoading}
            showTableFormat={false}
          />
        ) : view === 'calendar' ? (
          <CalendarView
            tasks={items}
            projectKey={projectKeyState}
            onTaskClick={handleTaskClick}
            onEventDrop={handleEventDrop}
            isLoading={isLoading}
          />
        ) : view === 'gantt' ? (
          <TimelineView
            tasks={items}
            projectKey={projectKeyState}
            onTaskClick={handleTaskClick}
            onTaskDateChange={handleTaskDateChange}
            isLoading={isLoading}
          />
        ) : null}
      </section>

      <TaskDrawer
        open={drawerOpen && Boolean(activeTask)}
        task={activeTask}
        projectId={projectId}
        projectKey={projectKeyState}
        statuses={statuses}
        iterations={iterations}
        onClose={() => setDrawerOpen(false)}
        onTaskUpdate={async (taskId, updates) => {
          await handleTaskUpdate(taskId, updates as TaskUpdatePayload);
        }}
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

// TaskDrawer moved to @/components/project/TaskDrawer.tsx

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
              Время:{' '}
              {formatAuditTimeValue((entry.after as { loggedTime?: unknown }).loggedTime)} /{' '}
              {formatAuditTimeValue((entry.after as { estimatedTime?: unknown }).estimatedTime)} ч
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
