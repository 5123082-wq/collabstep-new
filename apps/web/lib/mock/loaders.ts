import projectsRaw from '@/app/mock/projects.json';
import invoicesRaw from '@/app/mock/invoices.json';
import tasksRaw from '@/app/mock/tasks.json';
import { Project, type ProjectT } from '@/lib/schemas/project';
import { Invoice, type InvoiceT } from '@/lib/schemas/invoice';
import { Task, type TaskT } from '@/lib/schemas/task';
import { z, type ZodTypeAny } from 'zod';

function logValidationError(label: string, error: z.ZodError<unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[mock] Invalid ${label} data`, error);
  }
}

function loadCollection<Schema extends ZodTypeAny>(schema: Schema, raw: unknown, label: string) {
  const parsed = schema.array().safeParse(raw);

  if (!parsed.success) {
    logValidationError(label, parsed.error);
    return [] as z.infer<Schema>[];
  }

  return parsed.data as z.infer<Schema>[];
}

export function loadProjects(): ProjectT[] {
  return loadCollection(Project, projectsRaw, 'projects');
}

export function loadInvoices(): InvoiceT[] {
  return loadCollection(Invoice, invoicesRaw, 'invoices');
}

export function loadTasks(): TaskT[] {
  return loadCollection(Task, tasksRaw, 'tasks');
}
