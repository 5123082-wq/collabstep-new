import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import type { TaskStatus } from '@/domain/projects/types';
import { InvalidTaskStatusError, TaskNotFoundError, tasksService } from '@collabverse/api';

const TaskPatchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['new', 'in_progress', 'review', 'done', 'blocked'] as [TaskStatus, ...TaskStatus[]]).optional(),
  iterationId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  startAt: z.string().datetime().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  priority: z.enum(['low', 'med', 'high']).nullable().optional(),
  labels: z.array(z.string()).optional()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = TaskPatchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const body = parsed.data;
  try {
    const task = tasksService.update(params.id, params.taskId, {
      title: body.title,
      description: body.description ?? undefined,
      status: body.status,
      iterationId: body.iterationId ?? undefined,
      assigneeId: body.assigneeId ?? undefined,
      startAt: body.startAt ?? undefined,
      dueAt: body.dueAt ?? undefined,
      priority: body.priority ?? undefined,
      labels: body.labels
    });
    return NextResponse.json(task);
  } catch (err) {
    if (err instanceof InvalidTaskStatusError) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }
    if (err instanceof TaskNotFoundError) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    tasksService.delete(params.id, params.taskId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof TaskNotFoundError) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
