import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { projectsRepository, taskDependenciesRepository, DEFAULT_WORKSPACE_USER_ID } from '@collabverse/api';
import { flags } from '@/lib/flags';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check access for private projects
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;
  const project = projectsRepository.findById(params.id);

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!projectsRepository.hasAccess(project.id, currentUserId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Get all dependencies for the project
  const projectDependencies = taskDependenciesRepository.list({ projectId: params.id });

  return NextResponse.json({ items: projectDependencies });
}

const CreateDependencySchema = z.object({
  dependentTaskId: z.string().min(1),
  blockerTaskId: z.string().min(1),
  type: z.enum(['blocks', 'relates_to']).optional().default('blocks')
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check access for private projects
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;
  const project = projectsRepository.findById(params.id);

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!projectsRepository.hasAccess(project.id, currentUserId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const parsed = CreateDependencySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error }, { status: 400 });
  }

  try {
    const dependency = taskDependenciesRepository.create(parsed.data);
    return NextResponse.json(dependency, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('already exists')) {
        return NextResponse.json({ error: 'dependency_exists' }, { status: 409 });
      }
      if (err.message.includes('circular')) {
        return NextResponse.json({ error: 'circular_dependency' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

