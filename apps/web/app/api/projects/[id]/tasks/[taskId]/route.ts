import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import type { TaskStatus } from '@/domain/projects/types';
import { memory } from '@/mocks/projects-memory';
import { normalizeChecklist } from '../../../tasks-hierarchy';

const allowedStatuses = ['new', 'in_progress', 'review', 'done', 'blocked'] as [TaskStatus, ...TaskStatus[]];
const allowedKinds = ['epic', 'task', 'subtask'] as const;

const ChecklistItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1),
  done: z.boolean().optional()
});

const TaskPatchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(allowedStatuses).optional(),
  iterationId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  startAt: z.string().datetime().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  labels: z.array(z.string()).optional(),
  parentId: z.string().nullable().optional(),
  kind: z.enum(allowedKinds).optional(),
  order: z.number().int().min(0).max(100000).nullable().optional(),
  estimateMinutes: z.number().int().min(0).max(100000).nullable().optional(),
  spentMinutes: z.number().int().min(0).max(100000).nullable().optional(),
  checklist: z.array(ChecklistItemSchema).optional()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  if (!flags.PROJECTS_V1) {
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
    if (!body.parentId) {
      delete existing.parentId;
    } else {
      if (body.parentId === existing.id) {
        return NextResponse.json({ error: 'cyclic_parent' }, { status: 400 });
      }

      const parent = memory.TASKS.find((task) => task.id === body.parentId);
      if (!parent || parent.projectId !== existing.projectId) {
        return NextResponse.json({ error: 'invalid_parent' }, { status: 400 });
      }

      const visited = new Set<string>();
      let ancestor: typeof parent | undefined = parent;
      while (ancestor?.parentId) {
        if (ancestor.parentId === existing.id) {
          return NextResponse.json({ error: 'cyclic_parent' }, { status: 400 });
        }
        if (visited.has(ancestor.parentId)) {
          break;
        }
        visited.add(ancestor.parentId);
        ancestor = memory.TASKS.find((task) => task.id === ancestor?.parentId);
      }

      existing.parentId = body.parentId;
    }
  }
  if (body.kind) {
    existing.kind = body.kind;
  }
  if (body.order !== undefined) {
    if (body.order === null) {
      delete existing.order;
    } else {
      existing.order = body.order;
    }
  }
  if (body.estimateMinutes !== undefined) {
    if (body.estimateMinutes === null) {
      delete existing.estimateMinutes;
    } else {
      existing.estimateMinutes = body.estimateMinutes;
    }
  }
  if (body.spentMinutes !== undefined) {
    if (body.spentMinutes === null) {
      delete existing.spentMinutes;
    } else {
      existing.spentMinutes = body.spentMinutes;
    }
  }
  if (body.checklist !== undefined) {
    existing.checklist = normalizeChecklist(body.checklist) ?? [];
  }

  existing.updatedAt = new Date().toISOString();
  memory.TASKS[idx] = existing;

  return NextResponse.json(existing);
}
