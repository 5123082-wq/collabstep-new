import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { documentsRepository } from '@collabverse/api';
import { flags } from '@/lib/flags';

const DocumentCreateSchema = z.object({
  title: z.string().min(1),
  type: z.string().optional(),
  status: z.string().optional(),
  createdBy: z.string().default('admin.demo@collabverse.test')
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const items = documentsRepository.listByProject(params.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const parsed = DocumentCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const document = documentsRepository.createDocument({
    projectId: params.id,
    title: parsed.data.title,
    createdBy: parsed.data.createdBy,
    ...(parsed.data.type ? { type: parsed.data.type } : {}),
    ...(parsed.data.status ? { status: parsed.data.status } : {})
  });
  return NextResponse.json({ document }, { status: 201 });
}
