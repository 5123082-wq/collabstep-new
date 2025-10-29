import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { projectsRepository, tasksRepository } from '@collabverse/api';
import { flags } from '@/lib/flags';
import type { Task, TaskStatus, TaskTreeNode } from '@/domain/projects/types';
import { recordAudit } from '@/lib/audit/log';

function flattenTaskTree(tree: TaskTreeNode[]): Task[] {
  const result: Task[] = [];

  const visit = (node: TaskTreeNode) => {
    const { children, ...rest } = node;
    const normalized: Task = {
      ...(rest as Task),
      parentId: rest.parentId ?? null
    };
    result.push(normalized);
    if (Array.isArray(children)) {
      for (const child of children) {
        visit(child);
      }
    }
  };

  for (const node of tree) {
    visit(node);
  }

  return result;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1 && !flags.TASKS_WORKSPACE) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') as TaskStatus | null;
  const iterationId = sp.get('iterationId');
  const viewParam = sp.get('view');
  const view = viewParam === 'tree' ? 'tree' : 'list';

  const listOptions = {
    projectId: params.id,
    ...(status ? { status } : {}),
    ...(iterationId ? { iterationId } : {})
  } as const;

  if (view === 'tree') {
    const tree = tasksRepository.list({ ...listOptions, view: 'tree' }) as TaskTreeNode[];
    const items = flattenTaskTree(tree);
    return NextResponse.json({ tree, items });
  }

  const items = tasksRepository.list({ ...listOptions, view: 'list' }) as Task[];

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
  labels: z.array(z.string()).optional(),
  estimatedTime: z.number().int().nonnegative().nullable().optional(),
  loggedTime: z.number().int().nonnegative().optional()
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
    ...(Array.isArray(b.labels) ? { labels: b.labels } : {}),
    ...(b.estimatedTime !== undefined ? { estimatedTime: b.estimatedTime } : {}),
    ...(b.loggedTime !== undefined ? { loggedTime: b.loggedTime } : { loggedTime: 0 })
  }) as Task;

  const project = projectsRepository.findById(params.id);
  recordAudit({
    action: 'task.created',
    entity: { type: 'task', id: task.id },
    projectId: params.id,
    ...(project?.workspaceId ? { workspaceId: project.workspaceId } : {}),
    after: task
  });

  return NextResponse.json(task, { status: 201 });
}
