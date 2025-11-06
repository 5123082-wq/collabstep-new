'use client';

import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

type AssigneeAvatarProps = {
  assigneeId?: string;
  assigneeName?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function AssigneeAvatar({
  assigneeId,
  assigneeName,
  avatarUrl,
  isOnline = false,
  size = 'md',
  className
}: AssigneeAvatarProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const dotSizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'
  };

  const initials = assigneeName
    ? assigneeName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : assigneeId
      ? assigneeId.slice(0, 2).toUpperCase()
      : '?';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={assigneeName || assigneeId || 'Assignee'}
          className={cn('rounded-full border border-neutral-800', sizeClasses[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center font-semibold text-neutral-400',
            sizeClasses[size]
          )}
        >
          <Users className={cn('h-3 w-3 text-neutral-500')} />
        </div>
      )}
      {isOnline && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-neutral-900 bg-emerald-500',
            dotSizeClasses[size]
          )}
          aria-label="Online"
        />
      )}
    </div>
  );
}

export default AssigneeAvatar;

