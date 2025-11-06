'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Task, TaskStatus } from '@/domain/projects/types';
import type { TaskDependency } from '@/domain/projects/task-dependency';
import type { AuditLogEntry } from '@collabverse/api';
import { cn } from '@/lib/utils';
import { formatTaskDisplayKey } from '@/lib/project/calendar-utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  File, 
  MessageSquare, 
  Clock, 
  Link, 
  UserPlus,
  CheckCircle2,
  X
} from 'lucide-react';

type TaskDrawerTab = 'details' | 'dependencies' | 'comments' | 'history' | 'files';

type TaskComment = {
  id: string;
  body: string;
  authorId: string;
  author?: { name?: string; email?: string };
  createdAt: string;
  mentions?: string[];
};

type TaskAttachment = {
  id: string;
  filename: string;
  url?: string;
  size?: number;
  createdAt: string;
};

type TaskDrawerProps = {
  open: boolean;
  task: Task | null;
  projectId: string;
  projectKey?: string;
  statuses: TaskStatus[];
  iterations: Array<{ id: string; title: string }>;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onRefresh?: () => Promise<void>;
};

export function TaskDrawer({
  open,
  task,
  projectId,
  projectKey,
  statuses,
  iterations,
  onClose,
  onTaskUpdate,
  onRefresh
}: TaskDrawerProps) {
  const [activeTab, setActiveTab] = useState<TaskDrawerTab>('details');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [history, setHistory] = useState<AuditLogEntry[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const loadComments = useCallback(async () => {
    if (!task) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${task.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(Array.isArray(data.items) ? data.items : []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  }, [task, projectId]);

  const loadDependencies = useCallback(async () => {
    if (!task) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/dependencies`);
      if (response.ok) {
        const data = await response.json();
        const allDeps = Array.isArray(data.items) ? data.items : [];
        // Filter dependencies related to this task
        setDependencies(allDeps.filter(
          (dep: TaskDependency) => dep.dependentTaskId === task.id || dep.blockerTaskId === task.id
        ));
      }
    } catch (err) {
      console.error('Failed to load dependencies:', err);
    }
  }, [task, projectId]);

  const loadHistory = useCallback(async () => {
    if (!task) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/activity?entityType=task&entityId=${task.id}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setHistory(Array.isArray(data.items) ? data.items : []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, [task, projectId]);

  const loadAttachments = useCallback(async () => {
    if (!task) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/files?entityType=task&entityId=${task.id}`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(Array.isArray(data.items) ? data.items : []);
      }
    } catch (err) {
      console.error('Failed to load attachments:', err);
    }
  }, [task, projectId]);

  // Load data when task changes
  useEffect(() => {
    if (!open || !task) {
      return;
    }

    setIsLoading(true);
    void Promise.all([
      loadComments(),
      loadDependencies(),
      loadHistory(),
      loadAttachments()
    ]).finally(() => setIsLoading(false));
  }, [open, task, loadComments, loadDependencies, loadHistory, loadAttachments]);

  const handleCreateComment = useCallback(async () => {
    if (!task || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentText.trim() })
      });
      if (response.ok) {
        setCommentText('');
        await loadComments();
      }
    } catch (err) {
      console.error('Failed to create comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [task, projectId, commentText, isSubmittingComment, loadComments]);

  const handleCreateJobPosting = useCallback(async () => {
    if (!task) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${task.id}/create-job-posting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          title: task.title,
          description: task.description
        })
      });
      if (response.ok) {
        const data = await response.json();
        alert('Job posting создан! ' + (data.message || ''));
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        alert('Не удалось создать job posting');
      }
    } catch (err) {
      console.error('Failed to create job posting:', err);
      alert('Ошибка при создании job posting');
    }
  }, [task, projectId, onRefresh]);

  const tabs = [
    { id: 'details' as const, label: 'Детали', icon: File },
    { id: 'dependencies' as const, label: 'Зависимости', icon: Link },
    { id: 'comments' as const, label: 'Комментарии', icon: MessageSquare },
    { id: 'history' as const, label: 'История', icon: Clock },
    { id: 'files' as const, label: 'Файлы', icon: File }
  ];

  if (!task) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <SheetContent className="flex h-full w-full flex-col bg-neutral-950/95 sm:w-[600px]" side="right">
        <SheetHeader className="border-b border-neutral-800 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold text-white">{task.title}</SheetTitle>
              {projectKey && task.number && (
                <p className="mt-1 text-xs font-mono uppercase tracking-wide text-indigo-400">
                  {formatTaskDisplayKey(projectKey, task.number)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <nav className="border-b border-neutral-800">
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <TaskDetailsTab
              task={task}
              projectId={projectId}
              statuses={statuses}
              iterations={iterations}
              onTaskUpdate={onTaskUpdate}
              onCreateJobPosting={handleCreateJobPosting}
            />
          )}
          {activeTab === 'dependencies' && (
            <DependenciesTab
              task={task}
              projectId={projectId}
              projectKey={projectKey}
              dependencies={dependencies}
              isLoading={isLoading}
              onRefresh={loadDependencies}
            />
          )}
          {activeTab === 'comments' && (
            <CommentsTab
              comments={comments}
              commentText={commentText}
              setCommentText={setCommentText}
              isLoading={isLoading}
              isSubmitting={isSubmittingComment}
              onCreateComment={handleCreateComment}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab history={history} isLoading={isLoading} />
          )}
          {activeTab === 'files' && (
            <FilesTab
              task={task}
              projectId={projectId}
              attachments={attachments}
              isLoading={isLoading}
              onRefresh={loadAttachments}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Details Tab Component
function TaskDetailsTab({
  task,
  projectId,
  statuses,
  iterations,
  onTaskUpdate,
  onCreateJobPosting
}: {
  task: Task;
  projectId: string;
  statuses: TaskStatus[];
  iterations: Array<{ id: string; title: string }>;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onCreateJobPosting: () => void;
}) {
  const toInputDateTime = (value?: string | null): string => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority || '');
  const [iterationId, setIterationId] = useState(task.iterationId || '');
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [startAt, setStartAt] = useState(task.startAt ? toInputDateTime(task.startAt) : '');
  const [dueAt, setDueAt] = useState(task.dueAt ? toInputDateTime(task.dueAt) : '');
  const [storyPoints, setStoryPoints] = useState('');
  const [labels, setLabels] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [loggedTime, setLoggedTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority || '');
    setIterationId(task.iterationId || '');
    setAssigneeId(task.assigneeId || '');
    setStartAt(task.startAt ? toInputDateTime(task.startAt) : '');
    setDueAt(task.dueAt ? toInputDateTime(task.dueAt) : '');
    setStoryPoints(task.storyPoints ? String(task.storyPoints) : '');
    setLabels(Array.isArray(task.labels) ? task.labels.join(', ') : '');
    setEstimatedTime(
      typeof task.estimatedTime === 'number' && Number.isFinite(task.estimatedTime)
        ? String(task.estimatedTime)
        : ''
    );
    setLoggedTime(
      typeof task.loggedTime === 'number' && Number.isFinite(task.loggedTime)
        ? String(task.loggedTime)
        : ''
    );
  }, [task]);

  const fromInputDate = (value: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<Task> = {};
      if (title.trim() !== task.title) {
        updates.title = title.trim();
      }
      if (description !== (task.description || '')) {
        if (description) {
          updates.description = description;
        }
      }
      if (status !== task.status) {
        updates.status = status;
      }
      if (priority !== (task.priority || '')) {
        if (priority) {
          updates.priority = priority as 'low' | 'med' | 'high' | 'urgent';
        }
      }
      if (iterationId !== (task.iterationId || '')) {
        if (iterationId) {
          updates.iterationId = iterationId;
        }
      }
      if (assigneeId !== (task.assigneeId || '')) {
        if (assigneeId) {
          updates.assigneeId = assigneeId;
        }
      }
      const nextStart = fromInputDate(startAt);
      if (nextStart !== (task.startAt || null)) {
        if (nextStart) {
          updates.startAt = nextStart;
        }
      }
      const nextDue = fromInputDate(dueAt);
      if (nextDue !== (task.dueAt || null)) {
        if (nextDue) {
          updates.dueAt = nextDue;
        }
      }
      const nextStoryPoints = storyPoints ? Number.parseInt(storyPoints, 10) : null;
      if (nextStoryPoints !== (task.storyPoints ?? null)) {
        updates.storyPoints = Number.isFinite(nextStoryPoints) ? nextStoryPoints : null;
      }
      const parsedLabels = labels
        .split(',')
        .map((label) => label.trim())
        .filter((label) => label.length > 0);
      const currentLabels = Array.isArray(task.labels) ? task.labels : [];
      if (parsedLabels.join('|') !== currentLabels.join('|')) {
        updates.labels = parsedLabels;
      }
      if (estimatedTime) {
        const nextEstimatedTime = Number.parseFloat(estimatedTime);
        if (Number.isFinite(nextEstimatedTime) && nextEstimatedTime >= 0 && nextEstimatedTime !== (task.estimatedTime ?? null)) {
          updates.estimatedTime = nextEstimatedTime;
        }
      } else if (task.estimatedTime !== null && task.estimatedTime !== undefined) {
        updates.estimatedTime = null;
      }
      if (loggedTime) {
        const nextLoggedTime = Number.parseFloat(loggedTime);
        if (Number.isFinite(nextLoggedTime) && nextLoggedTime >= 0 && nextLoggedTime !== (task.loggedTime ?? null)) {
          updates.loggedTime = nextLoggedTime;
        }
      } else if (task.loggedTime !== null && task.loggedTime !== undefined) {
        updates.loggedTime = null;
      }

      if (Object.keys(updates).length > 0) {
        await onTaskUpdate(task.id, updates);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
            Название
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Опишите задачу..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Статус
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Приоритет
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Без приоритета</option>
              <option value="low">Низкий</option>
              <option value="med">Средний</option>
              <option value="high">Высокий</option>
              <option value="urgent">Срочно</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Итерация
            </label>
            <select
              value={iterationId}
              onChange={(e) => setIterationId(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Без итерации</option>
              {iterations.map((iter) => (
                <option key={iter.id} value={iter.id}>
                  {iter.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Исполнитель
            </label>
            <input
              type="text"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              placeholder="user_id"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Начало
            </label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Дедлайн
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Story Points
            </label>
            <input
              type="number"
              min="0"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Оценка времени (ч)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Залогировано времени (ч)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={loggedTime}
              onChange={(e) => setLoggedTime(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Метки
            </label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              placeholder="product, design, urgent"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-t border-neutral-800 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
        <button
          type="button"
          onClick={onCreateJobPosting}
          className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
        >
          <UserPlus className="h-4 w-4" />
          Найти исполнителя
        </button>
      </div>
    </div>
  );
}

// Dependencies Tab Component
function DependenciesTab({
  task,
  projectId,
  projectKey,
  dependencies,
  isLoading,
  onRefresh
}: {
  task: Task;
  projectId: string;
  projectKey?: string | undefined;
  dependencies: TaskDependency[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}) {
  const blockers = dependencies.filter((d) => d.dependentTaskId === task.id);
  const blocked = dependencies.filter((d) => d.blockerTaskId === task.id);

  if (isLoading) {
    return <div className="text-sm text-neutral-400">Загрузка зависимостей...</div>;
  }

  return (
    <div className="space-y-6">
      {blockers.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Блокируется задачами:</h3>
          <div className="space-y-2">
            {blockers.map((dep) => (
              <div
                key={dep.id}
                className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⚠</span>
                  <span className="text-sm text-white">
                    {projectKey && dep.blockerTaskId.match(/^\d+$/) ? (
                      <span className="font-mono uppercase text-indigo-400">
                        {formatTaskDisplayKey(projectKey, Number.parseInt(dep.blockerTaskId, 10))}
                      </span>
                    ) : (
                      dep.blockerTaskId
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {blocked.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Блокирует задачи:</h3>
          <div className="space-y-2">
            {blocked.map((dep) => (
              <div
                key={dep.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3"
              >
                <span className="text-sm text-white">
                  {projectKey && dep.dependentTaskId.match(/^\d+$/) ? (
                    <span className="font-mono uppercase text-indigo-400">
                      {formatTaskDisplayKey(projectKey, Number.parseInt(dep.dependentTaskId, 10))}
                    </span>
                  ) : (
                    dep.dependentTaskId
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {blockers.length === 0 && blocked.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-center">
          <Link className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
          <p className="text-sm text-neutral-400">Нет зависимостей</p>
        </div>
      )}
    </div>
  );
}

// Comments Tab Component
function CommentsTab({
  comments,
  commentText,
  setCommentText,
  isLoading,
  isSubmitting,
  onCreateComment
}: {
  comments: TaskComment[];
  commentText: string;
  setCommentText: (text: string) => void;
  isLoading: boolean;
  isSubmitting: boolean;
  onCreateComment: () => void;
}) {
  if (isLoading) {
    return <div className="text-sm text-neutral-400">Загрузка комментариев...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-indigo-300">
                  {comment.author?.name?.[0] || comment.author?.email?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {comment.author?.name || comment.author?.email || 'Аноним'}
                </p>
                <p className="text-xs text-neutral-500">
                  {format(new Date(comment.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{comment.body}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-neutral-800 pt-4">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onCreateComment();
            }
          }}
          rows={4}
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          placeholder="Напишите комментарий... (Cmd/Ctrl+Enter для отправки)"
        />
        <button
          type="button"
          onClick={onCreateComment}
          disabled={!commentText.trim() || isSubmitting}
          className="w-full rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить комментарий'}
        </button>
      </div>
    </div>
  );
}

// History Tab Component
function HistoryTab({
  history,
  isLoading
}: {
  history: AuditLogEntry[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="text-sm text-neutral-400">Загрузка истории...</div>;
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'task.created': 'Создана задача',
      'task.updated': 'Обновлена задача',
      'task.status_changed': 'Изменён статус',
      'task.time_updated': 'Обновлено время'
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-3">
      {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
              <p className="text-sm text-neutral-400">Нет истории изменений</p>
            </div>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{getActionLabel(entry.action)}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {entry.actorId || 'Система'} · {format(new Date(entry.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
    </div>
  );
}

// Files Tab Component
function FilesTab({
  task,
  projectId,
  attachments,
  isLoading,
  onRefresh
}: {
  task: Task;
  projectId: string;
  attachments: TaskAttachment[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', 'task');
    formData.append('entityId', task.id);

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-neutral-400">Загрузка файлов...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-neutral-800 p-6 text-center">
        <File className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileUpload} />
          <span className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
            Перетащите файл или нажмите для загрузки
          </span>
        </label>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3"
            >
            <div className="flex items-center gap-3">
              <File className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-white">{attachment.filename}</p>
                  {attachment.size && (
                    <p className="text-xs text-neutral-500">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskDrawer;

