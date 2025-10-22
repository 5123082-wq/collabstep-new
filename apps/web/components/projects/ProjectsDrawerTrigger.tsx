'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useProjectsDrawerStore } from '@/stores/projectsDrawer';

interface ProjectsDrawerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  entityType?: string;
  entityId?: string | null;
  mode?: string | null;
}

export default function ProjectsDrawerTrigger({
  entityType = 'project',
  entityId = null,
  mode = 'preview',
  children,
  className,
  ...props
}: ProjectsDrawerTriggerProps) {
  const openDrawer = useProjectsDrawerStore((state) => state.openDrawer);

  return (
    <button
      type="button"
      onClick={() => openDrawer(entityType, entityId, mode)}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-indigo-500/60 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
        className
      )}
      {...props}
    >
      {children ?? 'Открыть карточку'}
    </button>
  );
}
