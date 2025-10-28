import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flags } from '@/lib/flags';
import { workspacesRepository, type Workspace } from '@collabverse/api';

const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(3).optional(),
  description: z.string().trim().max(2000).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  archived: z.boolean().optional()
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const workspace = workspacesRepository.findById(params.id);
  if (!workspace) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const members = workspacesRepository.listMembers(params.id);
  return NextResponse.json({ ...workspace, members });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = updateWorkspaceSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_error' }, { status: 400 });
  }

  const { archived, description, visibility, name } = parsed.data;
  const patch: Partial<Pick<Workspace, 'name' | 'description' | 'visibility' | 'archived'>> = {};
  if (typeof name === 'string') {
    patch.name = name;
  }
  if (typeof description === 'string') {
    patch.description = description;
  }
  if (typeof visibility === 'string') {
    patch.visibility = visibility;
  }
  if (typeof archived === 'boolean') {
    patch.archived = archived;
  }

  const workspace = workspacesRepository.update(params.id, patch);
  if (!workspace) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const members = workspacesRepository.listMembers(params.id);
  return NextResponse.json({ ...workspace, members });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const workspace = workspacesRepository.update(params.id, { archived: true });
  if (!workspace) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const members = workspacesRepository.listMembers(params.id);
  return NextResponse.json({ ...workspace, members });
}
