'use client';

import { useMemo, useState } from 'react';
import type { Task } from '@/domain/projects/types';
import {
  tasksToGanttTasks,
  calculateGanttDateRange,
  formatGanttDate,
  getDaysBetween,
  type GanttViewConfig
} from '@/lib/project/gantt-utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

type TimelineViewProps = {
  tasks: Task[];
  projectKey: string;
  onTaskClick?: (taskId: string) => void;
  onTaskDateChange?: (taskId: string, startDate: Date, dueDate: Date) => void;
  isLoading?: boolean;
};

export function TimelineView({
  tasks,
  projectKey,
  onTaskClick,
  onTaskDateChange,
  isLoading
}: TimelineViewProps) {
  const [config, setConfig] = useState<GanttViewConfig>(() => {
    const range = calculateGanttDateRange(tasks);
    return {
      startDate: range.startDate,
      endDate: range.endDate,
      scale: 'week'
    };
  });

  const ganttTasks = useMemo(() => {
    return tasksToGanttTasks(tasks, projectKey);
  }, [tasks, projectKey]);

  const days = useMemo(() => {
    const days: Date[] = [];
    let current = new Date(config.startDate);
    while (current <= config.endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [config.startDate, config.endDate]);

  const handleScaleChange = (newScale: GanttViewConfig['scale']) => {
    setConfig((prev) => ({ ...prev, scale: newScale }));
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const daysToMove = config.scale === 'day' ? 7 : config.scale === 'week' ? 14 : 30;
    setConfig((prev) => ({
      ...prev,
      startDate: new Date(prev.startDate.getTime() + (direction === 'next' ? 1 : -1) * daysToMove * 24 * 60 * 60 * 1000),
      endDate: new Date(prev.endDate.getTime() + (direction === 'next' ? 1 : -1) * daysToMove * 24 * 60 * 60 * 1000)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-neutral-900 bg-neutral-950/40 text-sm text-neutral-500">
        Загрузка временной шкалы...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('prev')}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleNavigate('next')}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScaleChange('day')}
            className={cn(
              'rounded-lg border px-3 py-1 text-xs transition',
              config.scale === 'day'
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            День
          </button>
          <button
            onClick={() => handleScaleChange('week')}
            className={cn(
              'rounded-lg border px-3 py-1 text-xs transition',
              config.scale === 'week'
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            Неделя
          </button>
          <button
            onClick={() => handleScaleChange('month')}
            className={cn(
              'rounded-lg border px-3 py-1 text-xs transition',
              config.scale === 'month'
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            Месяц
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="mb-2 flex border-b border-neutral-800">
            <div className="w-64 flex-shrink-0 border-r border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-400">
              Задача
            </div>
            <div className="flex flex-1">
              {days.map((day, idx) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex-shrink-0 border-r border-neutral-800 px-2 py-2 text-xs text-neutral-400',
                      config.scale === 'day' ? 'w-32' : config.scale === 'week' ? 'w-24' : 'w-20',
                      isWeekend && 'bg-neutral-900/50',
                      isToday && 'bg-indigo-500/10'
                    )}
                  >
                    <div className="font-semibold">{formatGanttDate(day, config.scale)}</div>
                    <div className="text-[10px] text-neutral-500">{format(day, 'EEE', { locale: ru })}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-1">
            {ganttTasks.map((task) => {
              const taskStart = new Date(task.start);
              const taskEnd = new Date(task.end);
              const taskDuration = getDaysBetween(taskStart, taskEnd);

              // Find the column index where task starts
              const startIdx = days.findIndex(
                (d) => format(d, 'yyyy-MM-dd') === format(taskStart, 'yyyy-MM-dd')
              );
              const endIdx = days.findIndex((d) => format(d, 'yyyy-MM-dd') === format(taskEnd, 'yyyy-MM-dd'));

              if (startIdx === -1) {
                return null;
              }

              const width = config.scale === 'day' ? 32 : config.scale === 'week' ? 24 : 20;
              const leftOffset = startIdx * width;

              return (
                <div key={task.id} className="relative flex border-b border-neutral-800 py-2">
                  <div className="w-64 flex-shrink-0 border-r border-neutral-800 px-4 text-sm text-neutral-200">
                    <button
                      onClick={() => onTaskClick?.(task.id)}
                      className="text-left hover:text-indigo-400"
                    >
                      {task.name}
                    </button>
                    <div className="mt-1 text-xs text-neutral-500">{task.project}</div>
                  </div>
                  <div className="relative flex-1">
                    <div
                      className={cn(
                        'absolute top-1 h-6 rounded-md border-l-2 px-2 text-xs text-white transition',
                        task.progress === 100
                          ? 'bg-emerald-500/80 border-emerald-400'
                          : task.progress >= 50
                            ? 'bg-sky-500/80 border-sky-400'
                            : 'bg-indigo-500/80 border-indigo-400'
                      )}
                      style={{
                        left: `${leftOffset}px`,
                        width: `${Math.max(taskDuration * width, width)}px`
                      }}
                    >
                      <div className="flex h-full items-center justify-between">
                        <span className="truncate">{task.name}</span>
                        {task.progress > 0 && (
                          <span className="ml-2 text-[10px]">{task.progress}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelineView;

