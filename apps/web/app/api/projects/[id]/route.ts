import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import type { Project, ProjectStage } from '@/domain/projects/types';
import { recordAudit } from '@/lib/audit/log';
import { projectsRepository, DEFAULT_WORKSPACE_USER_ID } from '@collabverse/api';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

function parseBudgetPatch(input: unknown): number | null | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (input === null) {
    return null;
  }
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }
  if (typeof input === 'string') {
    const normalized = input.trim().replace(',', '.');
    if (!normalized) {
      return null;
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const project = projectsRepository.findById(params.id);
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check access for private projects
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;
  
  if (!projectsRepository.hasAccess(project.id, currentUserId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const project = projectsRepository.findById(params.id);
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check access for private projects
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;
  
  if (!projectsRepository.hasAccess(project.id, currentUserId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<Project> & Record<string, unknown>;
  const allowedStages: ProjectStage[] = ['discovery', 'design', 'build', 'launch', 'support'];

  const patch: Parameters<typeof projectsRepository.update>[1] = {};

  if (typeof body.title === 'string' && body.title.trim()) {
    patch.title = body.title.trim();
  }
  if (typeof body.description === 'string') {
    patch.description = body.description;
  }
  if (typeof body.deadline === 'string') {
    patch.deadline = body.deadline;
  }
  if (typeof body.stage === 'string' && allowedStages.includes(body.stage as ProjectStage)) {
    patch.stage = body.stage as ProjectStage;
  }
  if (typeof body.key === 'string' && body.key.trim()) {
    patch.key = body.key.trim();
  }
  if (typeof body.status === 'string' && ['draft', 'active', 'on_hold', 'completed', 'archived'].includes(body.status)) {
    patch.status = body.status as Project['status'];
  }

  const budgetPlannedPatch = parseBudgetPatch(body.budgetPlanned);
  if (budgetPlannedPatch !== undefined) {
    patch.budgetPlanned = budgetPlannedPatch;
  }

  const budgetSpentPatch = parseBudgetPatch(body.budgetSpent);
  if (budgetSpentPatch !== undefined) {
    patch.budgetSpent = budgetSpentPatch;
  }

  const before = { ...project };
  const updated = projectsRepository.update(params.id, patch);

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  recordAudit({
    action: 'project.updated',
    entity: { type: 'project', id: updated.id },
    projectId: updated.id,
    workspaceId: updated.workspaceId,
    before,
    after: updated
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const project = projectsRepository.findById(params.id);
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check access for private projects
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;
  
  if (!projectsRepository.hasAccess(project.id, currentUserId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const deleted = projectsRepository.delete(params.id);

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  recordAudit({
    action: 'project.deleted',
    entity: { type: 'project', id: project.id },
    projectId: project.id,
    workspaceId: project.workspaceId,
    before: project
  });

  return NextResponse.json({ success: true });
}
