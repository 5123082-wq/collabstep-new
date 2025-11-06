'use client';

import type { ReactNode } from 'react';
import type { TaskTreeNode } from '@/domain/projects/types';
import { cn } from '@/lib/utils';
import { TASK_STATUS_LABELS, TASK_STATUS_STYLES } from './task-card';
import { formatTaskDisplayKey } from '@/lib/project/calendar-utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Clock, Users, Flag, ChevronRight, ChevronDown } from 'lucide-react';

type TaskRowProps = {
  task: TaskTreeNode;
  projectKey?: string;
  depth?: number;
  onSelect?: (taskId: string) => void;
  children?: ReactNode;
  isExpanded?: boolean | undefined;
  onToggle?: (() => void) | undefined;
  showMetadata?: boolean; // Show assignee, dates, priority in table format
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

export function TaskRow({ task, projectKey, depth = 0, onSelect, children, isExpanded, onToggle, showMetadata = false }: TaskRowProps) {
  const indent = Math.max(depth, 0) * 16;
  const hasChildren = Array.isArray(task.children) && task.children.length > 0;
  const taskKey = projectKey && task.number ? formatTaskDisplayKey(projectKey, task.number) : null;
  const isOverdue = task.dueAt && new Date(task.dueAt) < new Date() && task.status !== 'done';

  if (showMetadata) {
    // Table row format with columns
    return (
      <div className="flex flex-col" style={{ paddingLeft: indent }} data-task-row-id={task.id}>
        <div
          className={cn(
            'grid grid-cols-[1fr_120px_100px_120px_100px_80px] gap-3 items-center rounded-xl border border-neutral-900 bg-neutral-950/50 px-3 py-2 text-sm transition',
            onSelect && 'cursor-pointer hover:border-indigo-500/40 hover:bg-neutral-900',
            isOverdue && 'border-rose-500/40 bg-rose-950/20'
          )}
          role={onSelect ? 'button' : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onClick={onSelect ? () => onSelect(task.id) : undefined}
          onKeyDown={
            onSelect
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(task.id);
                  }
                }
              : undefined
          }
        >
          {/* Title column */}
          <div className="flex items-start gap-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded text-neutral-400 transition hover:text-indigo-400"
                onClick={(event) => {
                  event.stopPropagation();
                  if (onToggle) {
                    onToggle();
                  }
                }}
                aria-label={isExpanded ? 'Свернуть ветку' : 'Развернуть ветку'}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            ) : (
              <span className="w-4" aria-hidden />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {taskKey && (
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wide text-indigo-400 flex-shrink-0">
                    {taskKey}
                  </span>
                )}
                <p className="font-medium text-neutral-100 truncate">{task.title}</p>
              </div>
              {task.description && (
                <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">{task.description}</p>
              )}
            </div>
          </div>

          {/* Status column */}
          <div className="flex justify-center">
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap',
                TASK_STATUS_STYLES[task.status]
              )}
            >
              {TASK_STATUS_LABELS[task.status]}
            </span>
          </div>

          {/* Assignee column */}
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            {task.assigneeId ? (
              <>
                <Users className="h-3 w-3" />
                <span className="truncate">Исполнитель</span>
              </>
            ) : (
              <span className="text-neutral-600">—</span>
            )}
          </div>

          {/* Dates column */}
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            {task.dueAt ? (
              <>
                <Clock className={cn('h-3 w-3', isOverdue && 'text-rose-400')} />
                <span className={cn('truncate', isOverdue && 'text-rose-400')}>
                  {format(new Date(task.dueAt), 'd MMM', { locale: ru })}
                </span>
              </>
            ) : (
              <span className="text-neutral-600">—</span>
            )}
          </div>

          {/* Priority column */}
          <div className="flex items-center gap-1 text-xs">
            {task.priority ? (
              <>
                <Flag className={cn('h-3 w-3', PRIORITY_COLORS[task.priority])} />
                <span className={cn('truncate', PRIORITY_COLORS[task.priority])}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </>
            ) : (
              <span className="text-neutral-600">—</span>
            )}
          </div>

          {/* Story Points / Time column */}
          <div className="flex items-center justify-end gap-1 text-xs text-neutral-400">
            {task.storyPoints ? (
              <span className="font-semibold">{task.storyPoints} SP</span>
            ) : task.estimatedTime ? (
              <span>{task.estimatedTime}ч</span>
            ) : (
              <span className="text-neutral-600">—</span>
            )}
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Compact format (original)
  return (
    <div className="flex flex-col" style={{ paddingLeft: indent }} data-task-row-id={task.id}>
      <div
        className={cn(
          'flex items-start justify-between gap-3 rounded-xl border border-neutral-900 bg-neutral-950/50 px-3 py-2 text-sm transition',
          onSelect && 'cursor-pointer hover:border-indigo-500/40 hover:bg-neutral-900',
          isOverdue && 'border-rose-500/40 bg-rose-950/20'
        )}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={onSelect ? () => onSelect(task.id) : undefined}
        onKeyDown={
          onSelect
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(task.id);
                }
              }
            : undefined
        }
      >
        <div className="flex flex-1 items-start gap-2">
          {hasChildren ? (
            <button
              type="button"
              className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded border border-neutral-800 bg-neutral-900 text-[10px] font-semibold text-neutral-300 transition hover:border-indigo-500/50 hover:text-indigo-200"
              onClick={(event) => {
                event.stopPropagation();
                if (onToggle) {
                  onToggle();
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  if (onToggle) {
                    onToggle();
                  }
                }
              }}
              aria-label={isExpanded ? 'Свернуть ветку' : 'Развернуть ветку'}
              aria-expanded={isExpanded ?? false}
            >
              {isExpanded ? '−' : '+'}
            </button>
          ) : (
            <span className="mt-1 h-5 w-5" aria-hidden />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {taskKey && (
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wide text-indigo-400">
                  {taskKey}
                </span>
              )}
              <p className="font-medium text-neutral-100">{task.title}</p>
              {hasChildren ? (
                <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                  {task.children?.length} подзадач{task.children && task.children.length === 1 ? 'а' : ''}
                </span>
              ) : null}
              {task.priority && (
                <span className={cn('text-[10px]', PRIORITY_COLORS[task.priority])}>
                  <Flag className="h-3 w-3 inline" />
                </span>
              )}
            </div>
            {task.description ? <p className="mt-1 text-xs text-neutral-500">{task.description}</p> : null}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              {task.dueAt && (
                <div className={cn('flex items-center gap-1', isOverdue && 'text-rose-400')}>
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(task.dueAt), 'd MMM', { locale: ru })}</span>
                </div>
              )}
              {task.assigneeId && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>Исполнитель</span>
                </div>
              )}
              {isOverdue && <span className="text-rose-400">Просрочено</span>}
            </div>
          </div>
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            TASK_STATUS_STYLES[task.status]
          )}
        >
          {TASK_STATUS_LABELS[task.status]}
        </span>
      </div>
      {children}
    </div>
  );
}

export default TaskRow;


