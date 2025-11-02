import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { projectsRepository, DEFAULT_WORKSPACE_USER_ID } from '@collabverse/api';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import { recordAudit } from '@/lib/audit/log';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

const TimePatchSchema = z.object({
  estimatedTime: z.number().int().nonnegative().nullable().optional(),
  loggedTime: z.number().int().nonnegative().optional(),
  increment: z.number().int().nonnegative().optional()
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; 'task-id': string } }
) {
  if (!flags.PROJECTS_V1 && !flags.TASK_TIME_TRACKING) {
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

  const task = memory.TASKS.find((item) => item.id === params['task-id'] && item.projectId === params.id);
  if (!task) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({
    estimatedTime: task.estimatedTime ?? null,
    loggedTime: task.loggedTime ?? 0
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; 'task-id': string } }
) {
  if (!flags.PROJECTS_V1 && !flags.TASK_TIME_TRACKING) {
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

  const parsed = TimePatchSchema.safeParse(await req.json().catch(() => ({ } )));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const idx = memory.TASKS.findIndex((task) => task.id === params['task-id'] && task.projectId === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const task = memory.TASKS[idx];
  if (!task) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const body = parsed.data;
  const before = { ...task };

  if (body.estimatedTime !== undefined) {
    task.estimatedTime = body.estimatedTime;
  }

  if (body.loggedTime !== undefined) {
    task.loggedTime = body.loggedTime;
  }

  if (body.increment !== undefined) {
    const current = task.loggedTime ?? 0;
    task.loggedTime = current + body.increment;
  }

  task.updatedAt = new Date().toISOString();
  memory.TASKS[idx] = task;

  recordAudit({
    action: 'task.time_updated',
    entity: { type: 'task', id: task.id },
    projectId: params.id,
    ...(project.workspaceId ? { workspaceId: project.workspaceId } : {}),
    before,
    after: task
  });

  return NextResponse.json({
    estimatedTime: task.estimatedTime ?? null,
    loggedTime: task.loggedTime ?? 0
  });
}


