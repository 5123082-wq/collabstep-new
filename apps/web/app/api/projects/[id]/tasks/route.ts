import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import type { Task, TaskStatus } from '@/domain/projects/types';
import { memory } from '@/mocks/projects-memory';
import { buildTaskHierarchy, normalizeChecklist } from '../../tasks-hierarchy';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') as TaskStatus | null;
  const iterationId = sp.get('iterationId');

  const projectTasks = memory.TASKS.filter((task) => task.projectId === params.id);
  let items = projectTasks;
  if (status) {
    items = items.filter((task) => task.status === status);
  }
  if (iterationId) {
    items = items.filter((task) => task.iterationId === iterationId);
  }

  const hierarchy = buildTaskHierarchy(projectTasks, { status, iterationId });

  return NextResponse.json({
    items,
    hierarchy: {
      tree: hierarchy.tree,
      flat: hierarchy.flat
    },
    stats: hierarchy.stats
  });
}

const allowedStatuses = ['new', 'in_progress', 'review', 'done', 'blocked'] as [TaskStatus, ...TaskStatus[]];
const allowedKinds = ['epic', 'task', 'subtask'] as const;

const ChecklistItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1),
  done: z.boolean().optional()
});

const TaskCreate = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(allowedStatuses).optional(),
  parentId: z.string().optional(),
  iterationId: z.string().optional(),
  assigneeId: z.string().optional(),
  startAt: z.string().datetime().optional(),
  dueAt: z.string().datetime().optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  labels: z.array(z.string()).optional(),
  kind: z.enum(allowedKinds).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  estimateMinutes: z.number().int().min(0).max(100000).optional(),
  spentMinutes: z.number().int().min(0).max(100000).optional(),
  checklist: z.array(ChecklistItemSchema).optional()
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
  const parentId = typeof b.parentId === 'string' && b.parentId.trim().length > 0 ? b.parentId : undefined;
  const kind: Task['kind'] = b.kind ?? (parentId ? 'subtask' : 'task');
  const checklist = normalizeChecklist(b.checklist);

  const base = {
    id: crypto.randomUUID(),
    projectId: params.id,
    title: b.title ?? 'Новая задача',
    description: b.description ?? '',
    status,
    kind,
    createdAt: now,
    updatedAt: now
  };

  const task: Task = {
    ...base,
    ...(parentId ? { parentId } : {}),
    ...(b.iterationId ? { iterationId: b.iterationId } : {}),
    ...(b.assigneeId ? { assigneeId: b.assigneeId } : {}),
    ...(b.startAt ? { startAt: b.startAt } : {}),
    ...(b.dueAt ? { dueAt: b.dueAt } : {}),
    ...(b.priority ? { priority: b.priority } : {}),
    ...(typeof b.order === 'number' ? { order: b.order } : {}),
    ...(typeof b.estimateMinutes === 'number' ? { estimateMinutes: b.estimateMinutes } : {}),
    ...(typeof b.spentMinutes === 'number' ? { spentMinutes: b.spentMinutes } : {}),
    ...(Array.isArray(b.labels) ? { labels: b.labels } : {})
  } satisfies Task;

  if (Array.isArray(checklist)) {
    task.checklist = checklist;
  }

  memory.TASKS.push(task);

  return NextResponse.json(task, { status: 201 });
}
