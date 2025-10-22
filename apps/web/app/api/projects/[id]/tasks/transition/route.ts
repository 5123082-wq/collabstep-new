import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import type { TaskStatus } from '@/domain/projects/types';
import { InvalidTaskStatusError, TaskNotFoundError, tasksService } from '@collabverse/api';

const BodySchema = z.object({
  taskId: z.string().min(1),
  toStatus: z.enum(['new', 'in_progress', 'review', 'done', 'blocked'] as [TaskStatus, ...TaskStatus[]])
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const { taskId, toStatus } = parsed.data;

  try {
    const task = tasksService.transition(params.id, taskId, toStatus);
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
