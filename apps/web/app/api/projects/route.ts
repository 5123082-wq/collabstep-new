import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import type { Project, ProjectStage } from '@/domain/projects/types';
import { PROJECTS } from './storage';

export async function GET() {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ items: PROJECTS });
}

export async function POST(req: NextRequest) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const now = new Date().toISOString();
  const allowedStages: ProjectStage[] = ['discovery', 'design', 'build', 'launch', 'support'];
  const requestedStage = typeof body.stage === 'string' ? (body.stage as ProjectStage) : undefined;
  const stage = requestedStage && allowedStages.includes(requestedStage) ? requestedStage : 'discovery';
  const project: Project = {
    id: crypto.randomUUID(),
    title: typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'Без названия',
    description: typeof body.description === 'string' ? body.description : '',
    ownerId: typeof body.ownerId === 'string' ? body.ownerId : 'me',
    deadline: typeof body.deadline === 'string' ? body.deadline : undefined,
    stage,
    createdAt: now,
    updatedAt: now
  };

  PROJECTS.push(project);

  return NextResponse.json(project, { status: 201 });
}
