import type { Task } from '@/domain/projects/types';
import { format, parseISO } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    task: Task;
  };
}

/**
 * Converts tasks to calendar events for react-big-calendar
 */
export function tasksToCalendarEvents(tasks: Task[]): CalendarEvent[] {
  return tasks
    .filter((task) => task.dueAt || task.startAt || task.startDate)
    .map((task) => {
      const startDate = task.startDate || task.startAt || task.dueAt;
      const dueDate = task.dueAt || startDate;

      if (!startDate || !dueDate) {
        return null;
      }

      const start = parseISO(startDate);
      const end = dueDate ? parseISO(dueDate) : start;

      return {
        id: task.id,
        title: task.title,
        start,
        end: end > start ? end : start,
        resource: {
          task
        }
      };
    })
    .filter((event): event is CalendarEvent => event !== null);
}

/**
 * Formats task key for display (e.g., "PROJ-123")
 */
export function formatTaskDisplayKey(projectKey: string, taskNumber: number): string {
  return `${projectKey.toUpperCase()}-${taskNumber}`;
}

/**
 * Gets color for task status
 */
export function getTaskStatusColor(status: Task['status']): string {
  switch (status) {
    case 'new':
      return '#6366f1'; // indigo
    case 'in_progress':
      return '#0ea5e9'; // sky
    case 'review':
      return '#f59e0b'; // amber
    case 'done':
      return '#10b981'; // emerald
    case 'blocked':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Gets color for task priority
 */
export function getTaskPriorityColor(priority?: Task['priority']): string {
  switch (priority) {
    case 'urgent':
      return '#ef4444'; // red
    case 'high':
      return '#f59e0b'; // amber
    case 'med':
      return '#3b82f6'; // blue
    case 'low':
      return '#10b981'; // green
    default:
      return '#6b7280'; // gray
  }
}

