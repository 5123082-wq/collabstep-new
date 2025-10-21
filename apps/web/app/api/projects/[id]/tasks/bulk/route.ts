import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import type { TaskStatus } from '@/domain/projects/types';
import { InvalidTaskStatusError, tasksService } from '@collabverse/api';

const BulkSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('set_status'),
    taskIds: z.array(z.string().min(1)).min(1),
    status: z.enum(['new', 'in_progress', 'review', 'done', 'blocked'] as [TaskStatus, ...TaskStatus[]])
  }),
  z.object({
    operation: z.literal('set_iteration'),
    taskIds: z.array(z.string().min(1)).min(1),
    iterationId: z.string().nullable().optional()
  })
]);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = BulkSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const body = parsed.data;
  try {
    if (body.operation === 'set_status') {
      const items = tasksService.bulkSetStatus(params.id, { taskIds: body.taskIds, toStatus: body.status });
      return NextResponse.json({ items });
    }
    const items = tasksService.bulkSetIteration(params.id, {
      taskIds: body.taskIds,
      iterationId: body.iterationId ?? null
    });
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof InvalidTaskStatusError) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
