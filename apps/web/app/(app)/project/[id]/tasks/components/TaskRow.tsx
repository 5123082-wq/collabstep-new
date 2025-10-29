'use client';

import type { ReactNode } from 'react';
import type { TaskTreeNode } from '@/domain/projects/types';
import { cn } from '@/lib/utils';
import { TASK_STATUS_LABELS, TASK_STATUS_STYLES } from './TaskCard';

type TaskRowProps = {
  task: TaskTreeNode;
  depth?: number;
  onSelect?: (taskId: string) => void;
  children?: ReactNode;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
};

export function TaskRow({
  task,
  depth = 0,
  onSelect,
  children,
  hasChildren = false,
  isExpanded = false,
  onToggleExpand
}: TaskRowProps) {
  const indent = Math.max(depth, 0) * 16;
  return (
    <div className="flex flex-col" style={{ paddingLeft: indent }}>
      <div
        className={cn(
          'flex items-start justify-between gap-3 rounded-xl border border-neutral-900 bg-neutral-950/50 px-3 py-2 text-sm transition',
          onSelect && 'cursor-pointer hover:border-indigo-500/40 hover:bg-neutral-900'
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
              onClick={(event) => {
                event.stopPropagation();
                if (onToggleExpand) {
                  onToggleExpand();
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  onToggleExpand?.();
                }
              }}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Свернуть подзадачи' : 'Развернуть подзадачи'}
              className={cn(
                'mt-1 flex h-5 w-5 items-center justify-center rounded-md border border-transparent text-xs text-neutral-400 transition hover:border-neutral-700 hover:text-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                isExpanded && 'text-neutral-100'
              )}
            >
              <span className={cn('transition-transform', isExpanded ? 'rotate-90' : '')}>▸</span>
            </button>
          ) : (
            <span className="mt-1 h-5 w-5" aria-hidden="true" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-neutral-100">{task.title}</p>
              {hasChildren ? (
                <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                  {task.children?.length} подзадач{task.children && task.children.length === 1 ? 'а' : ''}
                </span>
              ) : null}
            </div>
            {task.description ? <p className="mt-1 text-xs text-neutral-500">{task.description}</p> : null}
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
