import { NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';

export async function GET() {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ items: memory.TEMPLATES.map((template) => ({ ...template })) });
}
