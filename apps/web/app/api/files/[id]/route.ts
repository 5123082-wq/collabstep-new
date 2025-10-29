import { NextRequest, NextResponse } from 'next/server';
import { filesRepository } from '@collabverse/api';
import { flags } from '@/lib/flags';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const file = filesRepository.findById(params.id);
  if (!file) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ file });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  filesRepository.delete(params.id);
  return NextResponse.json({ ok: true });
}
