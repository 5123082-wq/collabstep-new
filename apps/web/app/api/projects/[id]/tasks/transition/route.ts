import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { projectsRepository, DEFAULT_WORKSPACE_USER_ID } from '@collabverse/api';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import type { TaskStatus } from '@/domain/projects/types';
import { recordAudit } from '@/lib/audit/log';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

const BodySchema = z.object({
  taskId: z.string().min(1),
  toStatus: z.enum(['new', 'in_progress', 'review', 'done', 'blocked'] as [TaskStatus, ...TaskStatus[]])
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const { taskId, toStatus } = parsed.data;
  const idx = memory.TASKS.findIndex((task) => task.id === taskId && task.projectId === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const flow = memory.WORKFLOWS[params.id]?.statuses ?? ['new', 'in_progress', 'review', 'done'];
  if (!flow.includes(toStatus)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const task = memory.TASKS[idx];
  if (!task) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const before = { ...task };
  task.status = toStatus;
  task.updatedAt = new Date().toISOString();

  recordAudit({
    action: 'task.status_changed',
    entity: { type: 'task', id: task.id },
    projectId: params.id,
    ...(project.workspaceId ? { workspaceId: project.workspaceId } : {}),
    before,
    after: task
  });

  return NextResponse.json(task);
}
