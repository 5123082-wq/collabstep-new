import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import type { Task, TaskStatus } from '@/domain/projects/types';
import { memory } from '@/mocks/projects-memory';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') as TaskStatus | null;
  const iterationId = sp.get('iterationId');

  let items = memory.TASKS.filter((task) => task.projectId === params.id);
  if (status) {
    items = items.filter((task) => task.status === status);
  }
  if (iterationId) {
    items = items.filter((task) => task.iterationId === iterationId);
  }

  return NextResponse.json({ items });
}

const TaskCreate = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['new', 'in_progress', 'review', 'done', 'blocked']).optional(),
  parentId: z.string().optional(),
  iterationId: z.string().optional(),
  assigneeId: z.string().optional(),
  startAt: z.string().datetime().optional(),
  dueAt: z.string().datetime().optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  labels: z.array(z.string()).optional()
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = TaskCreate.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const b = parsed.data;
  const now = new Date().toISOString();
  const status: TaskStatus = b.status ?? 'new';

  const base = {
    id: crypto.randomUUID(),
    projectId: params.id,
    title: b.title ?? 'Новая задача',
    description: b.description ?? '',
    status,
    createdAt: now,
    updatedAt: now
  };

  const task: Task = {
    ...base,
    ...(b.parentId ? { parentId: b.parentId } : {}),
    ...(b.iterationId ? { iterationId: b.iterationId } : {}),
    ...(b.assigneeId ? { assigneeId: b.assigneeId } : {}),
    ...(b.startAt ? { startAt: b.startAt } : {}),
    ...(b.dueAt ? { dueAt: b.dueAt } : {}),
    ...(b.priority ? { priority: b.priority } : {}),
    ...(Array.isArray(b.labels) ? { labels: b.labels } : {})
  } satisfies Task;

  memory.TASKS.push(task);

  return NextResponse.json(task, { status: 201 });
}
