'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FilterButtonProps = {
  id: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function FilterButton({ id, label, active, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-semibold transition',
        active
          ? 'border-indigo-400 bg-indigo-500/20 text-white'
          : 'border-neutral-800 text-neutral-300 hover:border-indigo-400/60 hover:text-white'
      )}
    >
      {label}
    </button>
  );
}

type ProjectsSectionFiltersProps = {
  children: ReactNode;
  className?: string;
};

export function ProjectsSectionFilters({ children, className }: ProjectsSectionFiltersProps) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>;
}

