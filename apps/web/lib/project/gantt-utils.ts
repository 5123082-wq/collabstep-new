import type { Task } from '@/domain/projects/types';
import { parseISO, format, addDays, differenceInDays, startOfDay, endOfDay } from 'date-fns';

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string[];
  type?: 'task' | 'milestone';
  project?: string;
}

export interface GanttViewConfig {
  startDate: Date;
  endDate: Date;
  scale: 'day' | 'week' | 'month';
}

/**
 * Converts tasks to Gantt chart format
 */
export function tasksToGanttTasks(tasks: Task[], projectKey: string): GanttTask[] {
  return tasks
    .filter((task) => task.startAt || task.startDate || task.dueAt)
    .map((task) => {
      const startDate = task.startDate || task.startAt;
      const dueDate = task.dueAt;

      // If no start date, use due date or today
      const start = startDate
        ? parseISO(startDate)
        : dueDate
          ? parseISO(dueDate)
          : new Date();

      // If no due date, add estimated duration or default to 1 day
      const duration =
        task.estimatedTime && task.estimatedTime > 0
          ? Math.ceil(task.estimatedTime / 8) // Convert hours to days (8 hours per day)
          : 1;
      const end = dueDate ? parseISO(dueDate) : addDays(start, duration);

      // Calculate progress based on status
      let progress = 0;
      if (task.status === 'done') {
        progress = 100;
      } else if (task.status === 'review') {
        progress = 75;
      } else if (task.status === 'in_progress') {
        progress = 50;
      } else if (task.status === 'blocked') {
        progress = 0;
      }

      return {
        id: task.id,
        name: task.title,
        start: startOfDay(start),
        end: endOfDay(end),
        progress,
        type: 'task',
        project: `${projectKey}-${task.number}`
      };
    });
}

/**
 * Calculates the date range for Gantt chart from tasks
 */
export function calculateGanttDateRange(tasks: Task[]): { startDate: Date; endDate: Date } {
  const dates: Date[] = [];

  for (const task of tasks) {
    if (task.startAt || task.startDate) {
      dates.push(parseISO(task.startAt || task.startDate!));
    }
    if (task.dueAt) {
      dates.push(parseISO(task.dueAt));
    }
  }

  if (dates.length === 0) {
    const today = new Date();
    return {
      startDate: startOfDay(today),
      endDate: endOfDay(addDays(today, 30))
    };
  }

  const startDate = startOfDay(new Date(Math.min(...dates.map((d) => d.getTime()))));
  const endDate = endOfDay(new Date(Math.max(...dates.map((d) => d.getTime()))));

  // Add some padding
  return {
    startDate: addDays(startDate, -7),
    endDate: addDays(endDate, 7)
  };
}

/**
 * Formats date for Gantt chart header
 */
export function formatGanttDate(date: Date, scale: GanttViewConfig['scale']): string {
  switch (scale) {
    case 'day':
      return format(date, 'd MMM');
    case 'week':
      return format(date, 'd MMM');
    case 'month':
      return format(date, 'MMM yyyy');
    default:
      return format(date, 'd MMM yyyy');
  }
}

/**
 * Gets the number of days between two dates
 */
export function getDaysBetween(start: Date, end: Date): number {
  return differenceInDays(endOfDay(end), startOfDay(start)) + 1;
}

