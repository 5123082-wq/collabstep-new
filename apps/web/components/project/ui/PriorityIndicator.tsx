'use client';

import { cn } from '@/lib/utils';
import { Flag } from 'lucide-react';

type PriorityIndicatorProps = {
  priority?: 'urgent' | 'high' | 'med' | 'low';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
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

const PRIORITY_BG_COLORS: Record<string, string> = {
  urgent: 'bg-rose-500/10 border-rose-400/40',
  high: 'bg-amber-500/10 border-amber-400/40',
  med: 'bg-blue-500/10 border-blue-400/40',
  low: 'bg-green-500/10 border-green-400/40'
};

export function PriorityIndicator({ priority, size = 'md', showLabel = false, className }: PriorityIndicatorProps) {
  if (!priority) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-3 w-3 text-[10px]',
    md: 'h-4 w-4 text-xs',
    lg: 'h-5 w-5 text-sm'
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {showLabel ? (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
            PRIORITY_BG_COLORS[priority],
            PRIORITY_COLORS[priority],
            sizeClasses[size]
          )}
        >
          <Flag className={cn('h-3 w-3')} />
          <span>{PRIORITY_LABELS[priority]}</span>
        </span>
      ) : (
        <Flag className={cn(PRIORITY_COLORS[priority], sizeClasses[size])} />
      )}
    </div>
  );
}

export default PriorityIndicator;

