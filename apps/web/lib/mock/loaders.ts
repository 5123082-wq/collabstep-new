import invoicesRaw from '@/app/mock/invoices.json';
import projectsRaw from '@/app/mock/projects.json';
import tasksRaw from '@/app/mock/tasks.json';
import { InvoicesSchema, type Invoice } from '@/lib/schemas/invoice';
import { ProjectsSchema, type Project } from '@/lib/schemas/project';
import { TasksSchema, type Task } from '@/lib/schemas/task';

const isDev = process.env.NODE_ENV !== 'production';

function logParseError(source: string, details: unknown) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(`[mock] Ошибка валидации данных ${source}`, details);
  }
}

let projectsCache: Project[] | null = null;
let tasksCache: Task[] | null = null;
let invoicesCache: Invoice[] | null = null;

export function loadProjects(): Project[] {
  if (projectsCache) {
    return projectsCache;
  }

  const result = ProjectsSchema.safeParse(projectsRaw);
  if (!result.success) {
    logParseError('projects.json', result.error.flatten());
    projectsCache = [];
    return projectsCache;
  }

  projectsCache = result.data;
  return projectsCache;
}

export function loadTasks(): Task[] {
  if (tasksCache) {
    return tasksCache;
  }

  const result = TasksSchema.safeParse(tasksRaw);
  if (!result.success) {
    logParseError('tasks.json', result.error.flatten());
    tasksCache = [];
    return tasksCache;
  }

  tasksCache = result.data;
  return tasksCache;
}

export function loadInvoices(): Invoice[] {
  if (invoicesCache) {
    return invoicesCache;
  }

  const result = InvoicesSchema.safeParse(invoicesRaw);
  if (!result.success) {
    logParseError('invoices.json', result.error.flatten());
    invoicesCache = [];
    return invoicesCache;
  }

  invoicesCache = result.data;
  return invoicesCache;
}
