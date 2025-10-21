import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import type { ProjectWorkflow, TaskStatus } from '@/domain/projects/types';

const DEFAULT: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];
const ALLOWED: TaskStatus[] = ['new', 'in_progress', 'review', 'done', 'blocked'];

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const wf = memory.WORKFLOWS[params.id] ?? { projectId: params.id, statuses: DEFAULT };
  return NextResponse.json(wf);
}

const WorkflowSchema = z.object({
  statuses: z.array(z.enum(ALLOWED as [TaskStatus, ...TaskStatus[]])).min(3).max(7)
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = WorkflowSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_statuses' }, { status: 400 });
  }

  const uniq = Array.from(new Set(parsed.data.statuses));
  if (uniq.length !== parsed.data.statuses.length) {
    return NextResponse.json({ error: 'duplicate_statuses' }, { status: 400 });
  }

  const wf: ProjectWorkflow = { projectId: params.id, statuses: uniq };
  memory.WORKFLOWS[params.id] = wf;

  return NextResponse.json(wf);
}
