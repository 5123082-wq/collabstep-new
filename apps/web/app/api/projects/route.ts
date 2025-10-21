import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import type { Project, ProjectStage } from '@/domain/projects/types';
import { memory } from '@/mocks/projects-memory';

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
  const projects =
    archivedFilter === null
      ? memory.PROJECTS
      : memory.PROJECTS.filter((project) => project.archived === archivedFilter);

  const aggregation = new Map<string, { count: number; labels: Set<string> }>();
  for (const task of memory.TASKS) {
    const entry = aggregation.get(task.projectId);
    if (!entry) {
      aggregation.set(task.projectId, {
        count: 1,
        labels: new Set(task.labels ?? [])
      });
    } else {
      entry.count += 1;
      if (Array.isArray(task.labels)) {
        for (const label of task.labels) {
          if (typeof label === 'string' && label) {
            entry.labels.add(label);
          }
        }
      }
    }
  }

  const items = projects.map((project) => {
    const stats = aggregation.get(project.id);
    const labels = stats ? Array.from(stats.labels.values()).sort((a, b) => a.localeCompare(b, 'ru')) : [];
    return {
      ...project,
      tasksCount: stats?.count ?? 0,
      labels
    };
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const now = new Date().toISOString();
  const allowedStages: ProjectStage[] = ['discovery', 'design', 'build', 'launch', 'support'];
  const requestedStage = typeof body.stage === 'string' ? (body.stage as ProjectStage) : undefined;
  const stage = requestedStage && allowedStages.includes(requestedStage) ? requestedStage : 'discovery';
  const project: Project = {
    id: crypto.randomUUID(),
    title: typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'Без названия',
    description: typeof body.description === 'string' ? body.description : '',
    ownerId: typeof body.ownerId === 'string' ? body.ownerId : 'me',
    stage,
    archived: false,
    createdAt: now,
    updatedAt: now,
    ...(typeof body.deadline === 'string' && body.deadline ? { deadline: body.deadline } : {})
  };

  memory.PROJECTS.push(project);

  return NextResponse.json(project, { status: 201 });
}
