'use client';

import type { ReactNode } from 'react';
import type { Task, TaskStatus } from '@/domain/projects/types';
import { cn } from '@/lib/utils';

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

type TaskCardProps = {
  task: Task;
  onClick?: (taskId: string) => void;
  className?: string;
  footer?: ReactNode;
};

export function TaskCard({ task, onClick, className, footer }: TaskCardProps) {
  const statusLabel = TASK_STATUS_LABELS[task.status];
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
        className
      )}
      data-task-id={task.id}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-100">{task.title}</p>
        <span
          className={cn(
            'whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            TASK_STATUS_STYLES[task.status]
          )}
        >
          {statusLabel}
        </span>
      </div>
      {task.description ? (
        <p className="line-clamp-3 text-xs text-neutral-400">{task.description}</p>
      ) : null}
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


