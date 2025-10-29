import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import type { Project, ProjectStage } from '@/domain/projects/types';
import { memory } from '@/mocks/projects-memory';

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

  const body = (await req.json().catch(() => ({}))) as Partial<Project> & Record<string, unknown>;
  const { id: _id, createdAt: _createdAt, ownerId: _ownerId, updatedAt: _updatedAt, archived: _archived, ...rest } = body;
  const safe: Partial<Omit<Project, 'id' | 'createdAt' | 'ownerId' | 'updatedAt' | 'archived'>> = {};
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

  const budgetPlannedPatch = parseBudgetPatch(body.budgetPlanned);
  if (budgetPlannedPatch !== undefined) {
    safe.budgetPlanned = budgetPlannedPatch;
  }

  const budgetSpentPatch = parseBudgetPatch(body.budgetSpent);
  if (budgetSpentPatch !== undefined) {
    safe.budgetSpent = budgetSpentPatch;
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
    archived: current.archived,
    title: safe.title ?? current.title
  };

  memory.PROJECTS[idx] = merged;

  return NextResponse.json(merged);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const idx = memory.PROJECTS.findIndex((item) => item.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  memory.PROJECTS.splice(idx, 1);
  memory.TASKS = memory.TASKS.filter((task) => task.projectId !== params.id);
  memory.ITERATIONS = memory.ITERATIONS.filter((iteration) => iteration.projectId !== params.id);
  delete memory.WORKFLOWS[params.id];

  return NextResponse.json({ success: true });
}
