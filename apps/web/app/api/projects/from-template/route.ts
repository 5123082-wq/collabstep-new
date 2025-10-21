import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Project } from '@/domain/projects/types';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import { createTemplateTasks, DEFAULT_STATUSES } from '../templates-utils';

const createFromTemplateSchema = z.object({
  templateId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(1, 'Название не может быть пустым')
    .max(200, 'Слишком длинное название')
    .optional()
});

export async function POST(req: NextRequest) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = createFromTemplateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { templateId, title } = parsed.data;
  const template = memory.TEMPLATES.find((item) => item.id === templateId);

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const now = new Date();
  const nowISO = now.toISOString();
  const projectTitle = (title ?? template.title).trim();
  const project: Project = {
    id: crypto.randomUUID(),
    title: projectTitle,
    description: template.summary,
    ownerId: 'me',
    stage: 'discovery',
    archived: false,
    createdAt: nowISO,
    updatedAt: nowISO
  };

  memory.PROJECTS.push(project);
  memory.WORKFLOWS[project.id] = {
    projectId: project.id,
    statuses: [...DEFAULT_STATUSES]
  };

  const tasks = createTemplateTasks(template.id, project.id, now);
  if (tasks.length > 0) {
    memory.TASKS.push(...tasks);
  }

  return NextResponse.json(
    {
      ...project,
      tasksCreated: tasks.length
    },
    { status: 201 }
  );
}
