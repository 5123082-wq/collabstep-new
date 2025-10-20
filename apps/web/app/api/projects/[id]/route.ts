import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import type { Project, ProjectStage } from '@/domain/projects/types';
import { memory } from '@/mocks/projects-memory';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const project = memory.PROJECTS.find((item) => item.id === params.id);
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const idx = memory.PROJECTS.findIndex((item) => item.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<Project>;
  const { id: _id, createdAt: _createdAt, ownerId: _ownerId, updatedAt: _updatedAt, ...rest } = body;
  const safe: Partial<Omit<Project, 'id' | 'createdAt' | 'ownerId' | 'updatedAt'>> = {};
  const allowedStages: ProjectStage[] = ['discovery', 'design', 'build', 'launch', 'support'];

  if (typeof rest.title === 'string' && rest.title.trim()) {
    safe.title = rest.title.trim();
  }
  if (typeof rest.description === 'string') {
    safe.description = rest.description;
  }
  if (typeof rest.deadline === 'string') {
    safe.deadline = rest.deadline;
  }
  if (typeof rest.stage === 'string' && allowedStages.includes(rest.stage as ProjectStage)) {
    safe.stage = rest.stage as ProjectStage;
  }
  const current = memory.PROJECTS[idx];
  if (!current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const merged: Project = {
    ...current,
    ...safe,
    updatedAt: new Date().toISOString(),
    id: current.id,
    ownerId: current.ownerId,
    createdAt: current.createdAt,
    title: safe.title ?? current.title
  };

  memory.PROJECTS[idx] = merged;

  return NextResponse.json(merged);
}
