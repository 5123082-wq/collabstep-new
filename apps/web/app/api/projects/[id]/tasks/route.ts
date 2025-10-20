import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import type { Task, TaskStatus } from '@/domain/projects/types';
import { TASKS } from '../../storage';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const items = TASKS.filter((task) => task.projectId === params.id);
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

  TASKS.push(task);

  return NextResponse.json(task, { status: 201 });
}
