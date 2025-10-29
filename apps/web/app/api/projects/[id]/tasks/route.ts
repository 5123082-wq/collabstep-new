import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { tasksRepository } from '@collabverse/api';
import { flags } from '@/lib/flags';
import type { Task, TaskStatus, TaskTreeNode } from '@/domain/projects/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1 && !flags.TASKS_WORKSPACE) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') as TaskStatus | null;
  const iterationId = sp.get('iterationId');
  const view = sp.get('view') === 'tree' ? 'tree' : 'flat';

  const listOptions = {
    projectId: params.id,
    ...(status ? { status } : {}),
    ...(iterationId ? { iterationId } : {})
  } as const;

  if (view === 'tree') {
    const flat = tasksRepository.list({ ...listOptions });
    const tree = tasksRepository.list({ ...listOptions, view: 'tree' }) as TaskTreeNode[];
    return NextResponse.json({ items: flat, tree });
  }

  const items = tasksRepository.list({ ...listOptions });

  return NextResponse.json({ items });
}

const TaskCreate = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['new', 'in_progress', 'review', 'done', 'blocked']).optional(),
  parentId: z.string().nullable().optional(),
  iterationId: z.string().optional(),
  assigneeId: z.string().optional(),
  startAt: z.string().datetime().optional(),
  dueAt: z.string().datetime().optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  labels: z.array(z.string()).optional()
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1 && !flags.TASKS_WORKSPACE) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = TaskCreate.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const b = parsed.data;
  const now = new Date().toISOString();
  const status: TaskStatus = b.status ?? 'new';

  const task = tasksRepository.create({
    projectId: params.id,
    title: b.title ?? 'Новая задача',
    status,
    createdAt: now,
    updatedAt: now,
    parentId: b.parentId ?? null,
    ...(b.description !== undefined ? { description: b.description } : {}),
    ...(b.iterationId ? { iterationId: b.iterationId } : {}),
    ...(b.assigneeId ? { assigneeId: b.assigneeId } : {}),
    ...(b.startAt ? { startAt: b.startAt } : {}),
    ...(b.dueAt ? { dueAt: b.dueAt } : {}),
    ...(b.priority ? { priority: b.priority } : {}),
    ...(Array.isArray(b.labels) ? { labels: b.labels } : {})
  }) as Task;

  return NextResponse.json(task, { status: 201 });
}
