import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { projectsRepository, tasksRepository, DEFAULT_WORKSPACE_USER_ID } from '@collabverse/api';
import { flags } from '@/lib/flags';
import type { TaskStatus } from '@/domain/projects/types';
import { memory } from '@/mocks/projects-memory';
import { recordAudit } from '@/lib/audit/log';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

const TaskPatchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['new', 'in_progress', 'review', 'done', 'blocked'] as [TaskStatus, ...TaskStatus[]]).optional(),
  parentId: z.string().nullable().optional(),
  iterationId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  startAt: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  priority: z.enum(['low', 'med', 'high', 'urgent']).optional(),
  labels: z.array(z.string()).optional(),
  estimatedTime: z.number().int().nonnegative().nullable().optional(),
  storyPoints: z.number().int().nonnegative().nullable().optional(),
  loggedTime: z.number().int().nonnegative().optional()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string; 'task-id': string } }) {
  if (!flags.PROJECTS_V1 && !flags.TASKS_WORKSPACE) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check access for private projects
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;
  const project = projectsRepository.findById(params.id);
  
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!projectsRepository.hasAccess(project.id, currentUserId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const parsed = TaskPatchSchema.safeParse(await req.json().catch(() => ({ } )));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const existing = tasksRepository.list({ projectId: params.id }).find((t) => t.id === params['task-id']);
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const body = parsed.data;
  const before = { ...existing };

  // Validate status against workflow
  if (body.status) {
    const flow = memory.WORKFLOWS[params.id]?.statuses ?? ['new', 'in_progress', 'review', 'done'];
    if (!flow.includes(body.status)) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }
  }

  const updatePayload: Record<string, unknown> = {};
  
  if (body.title) {
    updatePayload.title = body.title;
  }
  if (body.description !== undefined) {
    updatePayload.description = body.description ?? '';
  }
  if (body.status) {
    updatePayload.status = body.status;
  }
  if (body.iterationId !== undefined) {
    updatePayload.iterationId = body.iterationId;
  }
  if (body.assigneeId !== undefined) {
    updatePayload.assigneeId = body.assigneeId;
  }
  if (body.startDate !== undefined || body.startAt !== undefined) {
    const startValue = body.startDate ?? body.startAt;
    updatePayload.startDate = startValue;
    updatePayload.startAt = startValue;
  }
  if (body.dueAt !== undefined) {
    updatePayload.dueAt = body.dueAt;
  }
  if (body.priority) {
    updatePayload.priority = body.priority;
  }
  if (body.labels !== undefined) {
    updatePayload.labels = body.labels;
  }
  if (body.parentId !== undefined) {
    updatePayload.parentId = body.parentId;
  }
  if (body.estimatedTime !== undefined) {
    updatePayload.estimatedTime = body.estimatedTime;
  }
  if (body.storyPoints !== undefined) {
    updatePayload.storyPoints = body.storyPoints;
  }
  if (body.loggedTime !== undefined) {
    updatePayload.loggedTime = body.loggedTime;
  }

  const updated = tasksRepository.update(params['task-id'], updatePayload);

  if (!updated) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  recordAudit({
    action: 'task.updated',
    entity: { type: 'task', id: updated.id },
    projectId: params.id,
    ...(project.workspaceId ? { workspaceId: project.workspaceId } : {}),
    before,
    after: updated
  });

  return NextResponse.json(updated);
}



