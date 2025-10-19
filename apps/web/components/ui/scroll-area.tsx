'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('relative overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2', className)}
      {...props}
    />
  );
});
