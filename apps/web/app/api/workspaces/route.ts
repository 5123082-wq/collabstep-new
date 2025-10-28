import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import { DEFAULT_ACCOUNT_ID, workspacesRepository } from '@collabverse/api';

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().trim().max(2000).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  accountId: z.string().trim().optional()
});

export async function GET(): Promise<NextResponse> {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const items = workspacesRepository.list();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = createWorkspaceSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, description, visibility, accountId } = parsed.data;
  const trimmedDescription = description?.trim();
  const workspace = workspacesRepository.create({
    accountId: accountId && accountId.trim() ? accountId.trim() : DEFAULT_ACCOUNT_ID,
    name,
    ...(trimmedDescription ? { description: trimmedDescription } : {}),
    ...(visibility ? { visibility } : {})
  });

  return NextResponse.json(workspace, { status: 201 });
}
