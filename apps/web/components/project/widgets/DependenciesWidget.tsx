'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { TaskDependency } from '@/domain/projects/task-dependency';
import type { Task } from '@/domain/projects/types';
import { cn } from '@/lib/utils';
import { Link2 } from 'lucide-react';
import { formatTaskDisplayKey } from '@/lib/project/calendar-utils';

type DependenciesWidgetProps = {
  tasks: Task[];
  dependencies: TaskDependency[];
  projectId: string;
  projectKey?: string;
  isLoading?: boolean;
};

type DependencyWithTasks = TaskDependency & {
  dependentTask?: Task;
  blockerTask?: Task;
  isBlocked: boolean;
};

export function DependenciesWidget({
  tasks,
  dependencies,
  projectId,
  projectKey,
  isLoading
}: DependenciesWidgetProps) {
  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    for (const task of tasks) {
      map.set(task.id, task);
    }
    return map;
  }, [tasks]);

  const blockedTasks = useMemo<DependencyWithTasks[]>(() => {
    const blocked: DependencyWithTasks[] = [];

    for (const dep of dependencies) {
      const dependentTask = taskMap.get(dep.dependentTaskId);
      const blockerTask = taskMap.get(dep.blockerTaskId);

      if (dependentTask && blockerTask) {
        // Check if blocker is completed
        const isBlocked = blockerTask.status !== 'done';

        blocked.push({
          ...dep,
          dependentTask,
          blockerTask,
          isBlocked
        });
      }
    }

    // Sort: blocked first, then by type
    return blocked.sort((a, b) => {
      if (a.isBlocked && !b.isBlocked) return -1;
      if (!a.isBlocked && b.isBlocked) return 1;
      return 0;
    }).slice(0, 5); // Show top 5
  }, [dependencies, taskMap]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-neutral-800 rounded" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-neutral-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Зависимости</h3>
        <Link2 className="h-5 w-5 text-neutral-500" />
      </div>

      {blockedTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-center">
          <span className="mx-auto text-2xl text-emerald-400 mb-2 block">✓</span>
          <p className="text-sm text-neutral-400">Нет блокирующих зависимостей</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blockedTasks.map((dep) => (
            <div
              key={dep.id}
              className={cn(
                'rounded-xl border p-3',
                dep.isBlocked ? 'border-amber-500/40 bg-amber-500/10' : 'border-neutral-800 bg-neutral-900/60'
              )}
            >
              <div className="flex items-start gap-2">
                {dep.isBlocked && <span className="text-amber-400 mt-0.5 flex-shrink-0">⚠</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {projectKey && dep.dependentTask?.number && (
                      <Link
                        href={`/project/${projectId}/tasks?task=${dep.dependentTask.id}`}
                        className="text-[10px] font-mono font-semibold uppercase tracking-wide text-indigo-400 hover:text-indigo-300"
                      >
                        {formatTaskDisplayKey(projectKey, dep.dependentTask.number)}
                      </Link>
                    )}
                    <Link
                      href={`/project/${projectId}/tasks?task=${dep.dependentTask!.id}`}
                      className="text-sm font-medium text-white hover:text-indigo-300 truncate"
                    >
                      {dep.dependentTask!.title}
                    </Link>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {dep.type === 'blocks' ? 'Блокируется' : 'Связана с'}:{' '}
                    {projectKey && dep.blockerTask?.number && (
                      <span className="font-mono uppercase text-indigo-400">
                        {formatTaskDisplayKey(projectKey, dep.blockerTask.number)}
                      </span>
                    )}{' '}
                    <Link
                      href={`/project/${projectId}/tasks?task=${dep.blockerTask!.id}`}
                      className="text-neutral-400 hover:text-indigo-300"
                    >
                      {dep.blockerTask!.title}
                    </Link>
                  </p>
                  {dep.isBlocked && (
                    <p className="text-xs text-amber-400 mt-1">
                      Ожидает завершения блокирующей задачи
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DependenciesWidget;

