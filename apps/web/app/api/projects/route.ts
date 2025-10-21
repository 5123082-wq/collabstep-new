import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import { projectCatalogService, projectsRepository, type ProjectStage } from '@collabverse/api';

function parseArchivedFilter(value: string | null): boolean | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  if (normalized === 'true' || normalized === '1') {
    return true;
  }
  if (normalized === 'false' || normalized === '0') {
    return false;
  }
  return null;
}

export async function GET(req: NextRequest) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const archivedFilter = parseArchivedFilter(req.nextUrl.searchParams.get('archived'));
  const items = projectCatalogService.getProjects({ archived: archivedFilter });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const allowedStages: ProjectStage[] = ['discovery', 'design', 'build', 'launch', 'support'];
  const requestedStage = typeof body.stage === 'string' ? (body.stage as ProjectStage) : undefined;
  const stage = requestedStage && allowedStages.includes(requestedStage) ? requestedStage : 'discovery';
  const project = projectsRepository.create({
    title: typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'Без названия',
    description: typeof body.description === 'string' ? body.description : '',
    ownerId: typeof body.ownerId === 'string' ? body.ownerId : 'me',
    stage,
    deadline: typeof body.deadline === 'string' && body.deadline ? body.deadline : undefined
  });

  return NextResponse.json(project, { status: 201 });
}
