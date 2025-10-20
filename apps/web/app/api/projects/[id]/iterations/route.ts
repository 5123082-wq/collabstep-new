import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import type { Iteration } from '@/domain/projects/types';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const items = memory.ITERATIONS.filter((iteration) => iteration.projectId === params.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<Iteration>;

  const iteration: Iteration = {
    id: crypto.randomUUID(),
    projectId: params.id,
    title:
      typeof body.title === 'string' && body.title.trim().length > 0
        ? body.title.trim()
        : 'Iteration',
    start: typeof body.start === 'string' ? body.start : undefined,
    end: typeof body.end === 'string' ? body.end : undefined,
  };

  memory.ITERATIONS.push(iteration);

  return NextResponse.json(iteration, { status: 201 });
}
