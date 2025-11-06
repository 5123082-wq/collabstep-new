'use client';

import { useMemo } from 'react';
import type { Task } from '@/domain/projects/types';
import { Circle, Clock } from 'lucide-react';

type ProgressWidgetProps = {
  tasks: Task[];
  isLoading?: boolean;
};

export function ProgressWidget({ tasks, isLoading }: ProgressWidgetProps) {
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'done').length;
    const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
    const notStarted = tasks.filter((task) => task.status === 'new' || task.status === 'backlog').length;
    const overdue = tasks.filter(
      (task) => task.dueAt && new Date(task.dueAt) < new Date() && task.status !== 'done'
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
      completionRate
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-neutral-800 rounded" />
          <div className="h-20 bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Прогресс проекта</h3>
        <span className="text-sm font-semibold text-indigo-400">{metrics.completionRate}%</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${metrics.completionRate}%` }}
          />
        </div>
        <p className="text-xs text-neutral-500">
          {metrics.completed} из {metrics.total} задач завершено
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <span className="text-emerald-400 text-lg">✓</span>
          <div>
            <p className="text-xs text-neutral-500">Завершено</p>
            <p className="text-lg font-semibold text-white">{metrics.completed}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <Clock className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-xs text-neutral-500">В работе</p>
            <p className="text-lg font-semibold text-white">{metrics.inProgress}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <Circle className="h-5 w-5 text-neutral-400" />
          <div>
            <p className="text-xs text-neutral-500">Не начато</p>
            <p className="text-lg font-semibold text-white">{metrics.notStarted}</p>
          </div>
        </div>
        {metrics.overdue > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3">
            <span className="text-rose-400 text-xl">⚠</span>
            <div>
              <p className="text-xs text-neutral-500">Просрочено</p>
              <p className="text-lg font-semibold text-rose-400">{metrics.overdue}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressWidget;

