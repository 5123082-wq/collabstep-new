import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import type { Project } from '@/domain/projects/types';
import { PROJECTS } from '../storage';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const project = PROJECTS.find((item) => item.id === params.id);
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const idx = PROJECTS.findIndex((item) => item.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<Project>;
  const updated: Project = {
    ...PROJECTS[idx],
    ...body,
    updatedAt: new Date().toISOString()
  };
  PROJECTS[idx] = updated;

  return NextResponse.json(updated);
}
