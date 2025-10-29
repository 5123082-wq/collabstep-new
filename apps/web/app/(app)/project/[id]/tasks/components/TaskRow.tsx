'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TaskTreeNode } from '@/domain/projects/types';
import { cn } from '@/lib/utils';
import { TASK_STATUS_LABELS, TASK_STATUS_STYLES } from './TaskCard';

type TaskRowProps = {
  task: TaskTreeNode;
  depth?: number;
  onSelect?: (taskId: string) => void;
  children?: ReactNode;
  hasChildren?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
};

export function TaskRow({
  task,
  depth = 0,
  onSelect,
  children,
  hasChildren = false,
  expanded = true,
  onToggle
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
        <div className="flex flex-1 items-start gap-3">
          <div className="flex items-center pt-1">
            {hasChildren ? (
              <button
                type="button"
                aria-label={expanded ? 'Свернуть подзадачи' : 'Развернуть подзадачи'}
                aria-expanded={expanded}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle?.();
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral-900 bg-neutral-950/60 text-neutral-400 transition hover:border-indigo-500/50 hover:text-neutral-100"
              >
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform',
                    expanded ? 'text-indigo-200' : '-rotate-90 text-neutral-400'
                  )}
                />
              </button>
            ) : (
              <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-neutral-100">{task.title}</p>
            {hasChildren ? (
              <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                {task.children?.length} подзадач{task.children && task.children.length === 1 ? 'а' : ''}
              </span>
            ) : null}
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
      {expanded ? children : null}
    </div>
  );
}

export default TaskRow;
