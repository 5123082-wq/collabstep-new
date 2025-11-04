'use client';

import type { TaskStatus } from '@/domain/projects/types';
import { TASK_STATUS_LABELS, TASK_STATUS_STYLES } from '@/app/(app)/project/[id]/tasks/components/task-card';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-[10px]',
    lg: 'px-3 py-1 text-xs'
  };

  return (
    <span
      className={cn(
        'rounded-full border font-semibold uppercase tracking-wide whitespace-nowrap',
        TASK_STATUS_STYLES[status],
        sizeClasses[size],
        className
      )}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}

export default StatusBadge;

