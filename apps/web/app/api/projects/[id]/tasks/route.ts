import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import type { TaskStatus } from '@/domain/projects/types';
import { InvalidTaskStatusError, tasksService } from '@collabverse/api';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const sp = req.nextUrl.searchParams;
  const statusParams = sp.getAll('status').flatMap((value) => value.split(','));
  const statuses = statusParams
    .map((value) => value.trim())
    .filter((value): value is TaskStatus => ['new', 'in_progress', 'review', 'done', 'blocked'].includes(value as TaskStatus));
  const iterationId = sp.get('iterationId');
  const assigneeId = sp.get('assignee');
  const labelParams = sp.getAll('label').flatMap((value) => value.split(','));
  const labels = labelParams.map((value) => value.trim()).filter(Boolean);
  const query = sp.get('q');

  const items = tasksService.listByProject(params.id, {
    statuses,
    iterationId: iterationId ?? undefined,
    assigneeId: assigneeId ?? undefined,
    labels,
    query: query ?? undefined
  });

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
  try {
    const task = tasksService.create(params.id, {
      title: b.title,
      description: b.description,
      status: b.status,
      parentId: b.parentId,
      iterationId: b.iterationId,
      assigneeId: b.assigneeId,
      startAt: b.startAt,
      dueAt: b.dueAt,
      priority: b.priority,
      labels: b.labels
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    if (err instanceof InvalidTaskStatusError) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
