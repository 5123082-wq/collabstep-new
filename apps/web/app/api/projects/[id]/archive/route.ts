import { NextRequest, NextResponse } from 'next/server';
import type { Project } from '@/domain/projects/types';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import { recordAudit } from '@/lib/audit/log';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(_: NextRequest, { params }: RouteContext) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const idx = memory.PROJECTS.findIndex((project) => project.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const nowISO = new Date().toISOString();
  const current = memory.PROJECTS[idx];
  if (!current) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  const updated: Project = {
    ...current,
    archived: true,
    updatedAt: nowISO
  };

  memory.PROJECTS[idx] = updated;

  recordAudit({
    action: 'project.archived',
    entity: { type: 'project', id: updated.id },
    projectId: updated.id,
    workspaceId: updated.workspaceId,
    before: current,
    after: updated
  });

  return NextResponse.json({ id: updated.id, archived: updated.archived, updatedAt: updated.updatedAt });
}
