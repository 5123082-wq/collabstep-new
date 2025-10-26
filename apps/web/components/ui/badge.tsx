'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] px-2 py-0.5 text-xs font-medium text-[color:var(--accent-foreground)]',
        className
      )}
      {...props}
    />
  );
});
