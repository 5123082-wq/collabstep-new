import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import type { TaskStatus } from '@/domain/projects/types';
import { memory } from '@/mocks/projects-memory';

const TaskPatchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['new', 'in_progress', 'review', 'done', 'blocked'] as [TaskStatus, ...TaskStatus[]]).optional(),
  parentId: z.string().nullable().optional(),
  iterationId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  startAt: z.string().datetime().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  labels: z.array(z.string()).optional()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  if (!flags.PROJECTS_V1 && !flags.TASKS_WORKSPACE) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = TaskPatchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const idx = memory.TASKS.findIndex((task) => task.id === params.taskId && task.projectId === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const existing = memory.TASKS[idx];
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const body = parsed.data;

  if (typeof body.title === 'string') {
    existing.title = body.title;
  }
  if (body.description !== undefined) {
    existing.description = body.description ?? '';
  }
  if (body.status) {
    const flow = memory.WORKFLOWS[params.id]?.statuses ?? ['new', 'in_progress', 'review', 'done'];
    if (!flow.includes(body.status)) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }
    existing.status = body.status;
  }
  if (body.iterationId !== undefined) {
    if (body.iterationId === null || body.iterationId === '') {
      delete existing.iterationId;
    } else {
      existing.iterationId = body.iterationId;
    }
  }
  if (body.assigneeId !== undefined) {
    if (body.assigneeId === null || body.assigneeId === '') {
      delete existing.assigneeId;
    } else {
      existing.assigneeId = body.assigneeId;
    }
  }
  if (body.startAt !== undefined) {
    if (body.startAt === null || body.startAt === '') {
      delete existing.startAt;
    } else {
      existing.startAt = body.startAt;
    }
  }
  if (body.dueAt !== undefined) {
    if (body.dueAt === null || body.dueAt === '') {
      delete existing.dueAt;
    } else {
      existing.dueAt = body.dueAt;
    }
  }
  if (body.labels !== undefined) {
    existing.labels = body.labels;
  }

  if (body.parentId !== undefined) {
    if (body.parentId === null || body.parentId === '') {
      existing.parentId = null;
    } else {
      const parentId = body.parentId;
      if (parentId === existing.id) {
        return NextResponse.json({ error: 'invalid_parent' }, { status: 400 });
      }

      const visited = new Set<string>([existing.id]);
      let currentId: string | null = parentId;
      while (currentId) {
        if (visited.has(currentId)) {
          return NextResponse.json({ error: 'invalid_parent' }, { status: 400 });
        }
        visited.add(currentId);

        const parent = memory.TASKS.find((task) => task.id === currentId);
        if (!parent || parent.projectId !== params.id) {
          return NextResponse.json({ error: 'invalid_parent' }, { status: 400 });
        }

        currentId = parent.parentId ?? null;
      }

      existing.parentId = parentId;
    }
  }

  existing.updatedAt = new Date().toISOString();
  memory.TASKS[idx] = existing;

  return NextResponse.json(existing);
}
