import invoicesRaw from '@/app/mock/invoices.json';
import projectsRaw from '@/app/mock/projects.json';
import specialistsRaw from '@/app/mock/marketplace-specialists.json';
import tasksRaw from '@/app/mock/tasks.json';
import vacanciesRaw from '@/app/mock/marketplace-vacancies.json';
import { InvoicesSchema, type Invoice } from '@/lib/schemas/invoice';
import { ProjectsSchema, type Project } from '@/lib/schemas/project';
import { SpecialistsSchema, type Specialist } from '@/lib/schemas/marketplace-specialist';
import { TasksSchema, type Task } from '@/lib/schemas/task';
import { VacanciesSchema, type Vacancy } from '@/lib/schemas/marketplace-vacancy';

const isDev = process.env.NODE_ENV !== 'production';

function logParseError(source: string, details: unknown) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(`[mock] Ошибка валидации данных ${source}`, details);
  }
}

type LoadResult<T> = { items: T[]; error: string | null };

let projectsCache: Project[] | null = null;
let tasksCache: Task[] | null = null;
let invoicesCache: Invoice[] | null = null;
let specialistsCache: Specialist[] | null = null;
let specialistsError: string | null = null;
let vacanciesCache: Vacancy[] | null = null;
let vacanciesError: string | null = null;

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

export function loadSpecialists(): LoadResult<Specialist> {
  if (specialistsCache) {
    return { items: specialistsCache, error: specialistsError };
  }

  const result = SpecialistsSchema.safeParse(specialistsRaw);
  if (!result.success) {
    logParseError('marketplace-specialists.json', result.error.flatten());
    specialistsCache = [];
    specialistsError = 'Не удалось загрузить каталог специалистов';
    return { items: specialistsCache, error: specialistsError };
  }

  specialistsCache = result.data;
  specialistsError = null;
  return { items: specialistsCache, error: null };
}

export function loadVacancies(): LoadResult<Vacancy> {
  if (vacanciesCache) {
    return { items: vacanciesCache, error: vacanciesError };
  }

  const result = VacanciesSchema.safeParse(vacanciesRaw);
  if (!result.success) {
    logParseError('marketplace-vacancies.json', result.error.flatten());
    vacanciesCache = [];
    vacanciesError = 'Не удалось загрузить список вакансий';
    return { items: vacanciesCache, error: vacanciesError };
  }

  vacanciesCache = result.data;
  vacanciesError = null;
  return { items: vacanciesCache, error: null };
}
