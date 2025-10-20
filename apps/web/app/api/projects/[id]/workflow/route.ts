import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import type { ProjectWorkflow, TaskStatus } from '@/domain/projects/types';

const DEFAULT_STATUSES: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];
const ALLOWED_STATUSES: TaskStatus[] = ['new', 'in_progress', 'review', 'done', 'blocked'];

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const workflow =
    memory.WORKFLOWS[params.id] ?? { projectId: params.id, statuses: DEFAULT_STATUSES };
  return NextResponse.json(workflow);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<ProjectWorkflow>;
  const incoming = Array.isArray(body.statuses)
    ? (body.statuses.filter(Boolean) as TaskStatus[])
    : DEFAULT_STATUSES;
  const unique = Array.from(new Set(incoming));

  if (
    unique.length < 3 ||
    unique.length > 7 ||
    !unique.every((status) => ALLOWED_STATUSES.includes(status))
  ) {
    return NextResponse.json({ error: 'invalid_statuses' }, { status: 400 });
  }

  const workflow: ProjectWorkflow = { projectId: params.id, statuses: unique };
  memory.WORKFLOWS[params.id] = workflow;

  return NextResponse.json(workflow);
}
