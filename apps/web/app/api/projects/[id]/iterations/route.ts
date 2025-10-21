import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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

const IterCreate = z.object({
  title: z.string().trim().min(1).optional(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional()
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = IterCreate.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const { title, start, end } = parsed.data;
  const iterBase = {
    id: crypto.randomUUID(),
    projectId: params.id,
    title: (title && title.trim()) || 'Iteration'
  };
  const iter: Iteration = {
    ...iterBase,
    ...(start ? { start } : {}),
    ...(end ? { end } : {})
  };

  memory.ITERATIONS.push(iter);

  return NextResponse.json(iter, { status: 201 });
}
