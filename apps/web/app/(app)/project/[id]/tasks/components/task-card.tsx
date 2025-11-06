'use client';

import type { ReactNode } from 'react';
import type { Task, TaskStatus } from '@/domain/projects/types';
import { cn } from '@/lib/utils';
import { formatTaskDisplayKey } from '@/lib/project/calendar-utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Clock, User, Flag } from 'lucide-react';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  review: 'На ревью',
  done: 'Готово',
  blocked: 'Блокирована'
};

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  new: 'bg-indigo-500/10 text-indigo-200 border-indigo-400/40',
  in_progress: 'bg-sky-500/10 text-sky-200 border-sky-400/40',
  review: 'bg-amber-500/10 text-amber-200 border-amber-400/40',
  done: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/40',
  blocked: 'bg-rose-500/10 text-rose-200 border-rose-400/40'
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Срочно',
  high: 'Высокий',
  med: 'Средний',
  low: 'Низкий'
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-rose-400',
  high: 'text-amber-400',
  med: 'text-blue-400',
  low: 'text-green-400'
};

type TaskCardProps = {
  task: Task;
  projectKey?: string;
  onClick?: (taskId: string) => void;
  className?: string;
  footer?: ReactNode;
};

export function TaskCard({ task, projectKey, onClick, className, footer }: TaskCardProps) {
  const statusLabel = TASK_STATUS_LABELS[task.status];
  const taskKey = projectKey && task.number ? formatTaskDisplayKey(projectKey, task.number) : null;
  const isOverdue = task.dueAt && new Date(task.dueAt) < new Date() && task.status !== 'done';
  const priority = task.priority ?? 'med';

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? () => onClick(task.id) : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick(task.id);
              }
            }
          : undefined
      }
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70',
        onClick && 'cursor-pointer hover:border-indigo-500/60 hover:bg-neutral-900',
        isOverdue && 'border-rose-500/40 bg-rose-950/20',
        className
      )}
      data-task-id={task.id}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {taskKey && (
            <div className="mb-1 text-[10px] font-mono font-semibold uppercase tracking-wide text-indigo-400">
              {taskKey}
            </div>
          )}
          <p className="text-sm font-semibold text-neutral-100 line-clamp-2">{task.title}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className={cn(
              'whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              TASK_STATUS_STYLES[task.status]
            )}
          >
            {statusLabel}
          </span>
          {task.priority && (
            <div className={cn('flex items-center gap-1 text-[10px]', PRIORITY_COLORS[priority])}>
              <Flag className="h-3 w-3" />
              <span>{PRIORITY_LABELS[priority]}</span>
            </div>
          )}
        </div>
      </div>

      {task.description ? (
        <p className="line-clamp-2 text-xs text-neutral-400">{task.description}</p>
      ) : null}

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        {task.dueAt && (
          <div className={cn('flex items-center gap-1', isOverdue && 'text-rose-400')}>
            <Clock className="h-3 w-3" />
            <span>{format(new Date(task.dueAt), 'd MMM', { locale: ru })}</span>
          </div>
        )}
        {task.assigneeId && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Исполнитель</span>
          </div>
        )}
        {task.storyPoints && (
          <div className="flex items-center gap-1">
            <span className="font-semibold">{task.storyPoints}</span>
            <span>SP</span>
          </div>
        )}
        {task.estimatedTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{task.estimatedTime}ч</span>
          </div>
        )}
        {isOverdue && (
          <div className="flex items-center gap-1 text-rose-400">
            <span>⚠ Просрочено</span>
          </div>
        )}
      </div>

      {Array.isArray(task.labels) && task.labels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {task.labels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-400"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      {footer ? <div className="mt-auto text-xs text-neutral-500">{footer}</div> : null}
    </div>
  );
}

export default TaskCard;


