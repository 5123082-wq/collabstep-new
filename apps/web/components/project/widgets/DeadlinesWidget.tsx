'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { format, differenceInDays, isPast, isToday, isTomorrow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task } from '@/domain/projects/types';
import { cn } from '@/lib/utils';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatTaskDisplayKey } from '@/lib/project/calendar-utils';

type DeadlinesWidgetProps = {
  tasks: Task[];
  projectId: string;
  projectKey?: string;
  isLoading?: boolean;
};

type DeadlineTask = Task & {
  daysUntil: number;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  riskLevel: 'high' | 'medium' | 'low';
};

export function DeadlinesWidget({ tasks, projectId, projectKey, isLoading }: DeadlinesWidgetProps) {
  const upcomingDeadlines = useMemo<DeadlineTask[]>(() => {
    const now = new Date();
    const tasksWithDeadlines = tasks
      .filter((task) => task.dueAt && task.status !== 'done')
      .map((task) => {
        const dueDate = new Date(task.dueAt!);
        const daysUntil = differenceInDays(dueDate, now);
        const isOverdue = isPast(dueDate) && !isToday(dueDate);
        const isTodayDeadline = isToday(dueDate);
        const isTomorrowDeadline = isTomorrow(dueDate);

        let riskLevel: 'high' | 'medium' | 'low' = 'low';
        if (isOverdue) {
          riskLevel = 'high';
        } else if (daysUntil <= 3) {
          riskLevel = 'high';
        } else if (daysUntil <= 7) {
          riskLevel = 'medium';
        }

        return {
          ...task,
          daysUntil,
          isOverdue,
          isToday: isTodayDeadline,
          isTomorrow: isTomorrowDeadline,
          riskLevel
        } as DeadlineTask;
      })
      .sort((a, b) => {
        // Overdue first, then by date
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.daysUntil - b.daysUntil;
      })
      .slice(0, 5); // Show top 5

    return tasksWithDeadlines;
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-neutral-800 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
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
        <h3 className="text-lg font-semibold text-white">Предстоящие дедлайны</h3>
        <Calendar className="h-5 w-5 text-neutral-500" />
      </div>

      {upcomingDeadlines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
          <p className="text-sm text-neutral-400">Нет предстоящих дедлайнов</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingDeadlines.map((task) => (
            <Link
              key={task.id}
              href={`/project/${projectId}/tasks?task=${task.id}`}
              className={cn(
                'flex items-center justify-between gap-3 rounded-xl border p-3 transition hover:border-indigo-500/50 hover:bg-neutral-900/60',
                task.isOverdue && 'border-rose-500/40 bg-rose-500/10',
                task.isToday && 'border-amber-500/40 bg-amber-500/10',
                task.riskLevel === 'medium' && !task.isOverdue && !task.isToday && 'border-amber-500/20'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {projectKey && task.number && (
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wide text-indigo-400 flex-shrink-0">
                      {formatTaskDisplayKey(projectKey, task.number)}
                    </span>
                  )}
                  <p className="text-sm font-medium text-white truncate">{task.title}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-neutral-500">
                    {task.isOverdue
                      ? `Просрочено на ${Math.abs(task.daysUntil)} дн.`
                      : task.isToday
                        ? 'Сегодня'
                        : task.isTomorrow
                          ? 'Завтра'
                          : `Через ${task.daysUntil} дн.`}
                  </span>
                  {task.riskLevel === 'high' && (
                    <AlertTriangle className="h-3 w-3 text-rose-400" />
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-neutral-400">
                  {format(new Date(task.dueAt!), 'd MMM', { locale: ru })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeadlinesWidget;

