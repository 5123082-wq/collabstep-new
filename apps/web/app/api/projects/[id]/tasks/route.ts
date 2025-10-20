import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import type { Task, TaskStatus } from '@/domain/projects/types';
import { memory } from '@/mocks/projects-memory';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get('status') as TaskStatus | null;
  const iterationId = searchParams.get('iterationId');

  let items = memory.TASKS.filter((task) => task.projectId === params.id);
  if (status) {
    items = items.filter((task) => task.status === status);
  }
  if (iterationId) {
    items = items.filter((task) => task.iterationId === iterationId);
  }

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const now = new Date().toISOString();
  const allowedStatuses: TaskStatus[] = ['new', 'in_progress', 'review', 'done', 'blocked'];
  const requestedStatus = typeof body.status === 'string' ? (body.status as TaskStatus) : undefined;
  const status = requestedStatus && allowedStatuses.includes(requestedStatus) ? requestedStatus : 'new';

  const task: Task = {
    id: crypto.randomUUID(),
    projectId: params.id,
    parentId: typeof body.parentId === 'string' ? body.parentId : undefined,
    iterationId: typeof body.iterationId === 'string' ? body.iterationId : undefined,
    title: typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'Новая задача',
    description: typeof body.description === 'string' ? body.description : '',
    status,
    assigneeId: typeof body.assigneeId === 'string' ? body.assigneeId : undefined,
    dueAt: typeof body.dueAt === 'string' ? body.dueAt : undefined,
    priority: typeof body.priority === 'string' ? body.priority : 'med',
    labels: Array.isArray(body.labels) ? body.labels : [],
    createdAt: now,
    updatedAt: now
  };

  memory.TASKS.push(task);

  return NextResponse.json(task, { status: 201 });
}
