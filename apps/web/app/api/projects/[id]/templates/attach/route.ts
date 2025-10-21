import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Project } from '@/domain/projects/types';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import { createTemplateTasks, DEFAULT_STATUSES } from '../../../templates-utils';

const attachTemplateSchema = z.object({
  templateId: z.string().min(1)
});

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const project = memory.PROJECTS.find((candidate) => candidate.id === params.id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = attachTemplateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const template = memory.TEMPLATES.find((item) => item.id === parsed.data.templateId);
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  if (!memory.WORKFLOWS[project.id]) {
    memory.WORKFLOWS[project.id] = {
      projectId: project.id,
      statuses: [...DEFAULT_STATUSES]
    };
  }

  const now = new Date();
  const tasks = createTemplateTasks(template.id, project.id, now);
  if (tasks.length > 0) {
    memory.TASKS.push(...tasks);
  }

  const idx = memory.PROJECTS.findIndex((candidate) => candidate.id === project.id);
  if (idx !== -1) {
    const updated: Project = {
      ...project,
      updatedAt: now.toISOString()
    };
    memory.PROJECTS[idx] = updated;
  }

  return NextResponse.json({ projectId: project.id, tasksAdded: tasks.length });
}
