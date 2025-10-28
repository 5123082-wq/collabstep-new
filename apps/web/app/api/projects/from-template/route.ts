import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Project, ProjectStage, ProjectType, TaskStatus } from '@/domain/projects/types';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import {
  DEFAULT_WORKSPACE_ID,
  DEFAULT_WORKSPACE_USER_ID,
  projectBudgetsRepository,
  workspacesRepository,
  type ProjectBudget,
  type ProjectVisibility
} from '@collabverse/api';
import { createTemplateTasks, DEFAULT_STATUSES } from '../templates-utils';

const stageValues = ['discovery', 'design', 'build', 'launch', 'support'] as const;
const typeValues = ['product', 'marketing', 'operations', 'service', 'internal'] as const;
const allowedTaskStatuses: TaskStatus[] = ['new', 'in_progress', 'review', 'done', 'blocked'];

const createFromTemplateSchema = z.object({
  templateId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(1, 'Название не может быть пустым')
    .max(200, 'Слишком длинное название')
    .optional(),
  visibility: z.enum(['private', 'public']).optional(),
  stage: z.enum(stageValues).optional(),
  workspaceId: z.string().trim().min(1).optional(),
  type: z.enum(typeValues).optional(),
  deadline: z.string().trim().optional(),
  workflow: z
    .object({
      id: z.string().trim().optional(),
      statuses: z.array(z.string().trim()).min(3).max(7)
    })
    .optional(),
  finance: z
    .object({
      budget: z.string().trim().optional(),
      currency: z.string().trim().optional()
    })
    .optional(),
  ownerId: z.string().trim().optional()
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

  const {
    templateId,
    title,
    visibility: requestedVisibility,
    stage: requestedStage,
    workspaceId: requestedWorkspaceId,
    type: requestedType,
    deadline,
    workflow,
    finance,
    ownerId
  } = parsed.data;
  const template = memory.TEMPLATES.find((item) => item.id === templateId);

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const now = new Date();
  const nowISO = now.toISOString();
  const projectTitle = (title ?? template.title).trim();
  const stage: ProjectStage = requestedStage ?? 'discovery';
  const visibility: ProjectVisibility = requestedVisibility === 'public' ? 'public' : 'private';
  const type: ProjectType = requestedType ?? 'internal';
  const workspaceCandidate =
    typeof requestedWorkspaceId === 'string' && requestedWorkspaceId.trim()
      ? workspacesRepository.findById(requestedWorkspaceId.trim())
      : null;
  const workspaceId = workspaceCandidate ? workspaceCandidate.id : DEFAULT_WORKSPACE_ID;
  const owner = typeof ownerId === 'string' && ownerId.trim() ? ownerId.trim() : DEFAULT_WORKSPACE_USER_ID;
  const rawWorkflowStatuses = Array.isArray(workflow?.statuses) ? workflow.statuses : [];
  const filteredWorkflowStatuses = rawWorkflowStatuses
    .map((status) => status.trim())
    .filter((status): status is TaskStatus => (allowedTaskStatuses as readonly string[]).includes(status));
  const uniqueWorkflowStatuses = Array.from(new Set(filteredWorkflowStatuses));
  const workflowStatuses = uniqueWorkflowStatuses.length >= 3 ? uniqueWorkflowStatuses : [...DEFAULT_STATUSES];

  const projectId = crypto.randomUUID();
  const workflowId = workflow?.id ?? `wf-${projectId}`;

  const project: Project = {
    id: projectId,
    workspaceId,
    title: projectTitle,
    description: template.summary,
    ownerId: owner,
    stage,
    type,
    visibility,
    workflowId,
    archived: false,
    createdAt: nowISO,
    updatedAt: nowISO
  };

  if (typeof deadline === 'string' && deadline.trim()) {
    project.deadline = deadline.trim();
  }

  memory.PROJECTS.push(project);
  memory.WORKFLOWS[project.id] = {
    projectId: project.id,
    statuses: workflowStatuses
  };

  const members = memory.PROJECT_MEMBERS[project.id] ?? [];
  members.push({ userId: owner, role: 'owner' });
  memory.PROJECT_MEMBERS[project.id] = members;

  const tasks = createTemplateTasks(template.id, project.id, now);
  if (tasks.length > 0) {
    memory.TASKS.push(...tasks);
  }

  if (finance?.currency) {
    const budget: ProjectBudget = {
      projectId: project.id,
      currency: finance.currency.toUpperCase(),
      updatedAt: nowISO
    };
    if (finance.budget) {
      budget.total = finance.budget;
    }
    projectBudgetsRepository.upsert(budget);
  }

  return NextResponse.json(
    {
      ...project,
      tasksCreated: tasks.length
    },
    { status: 201 }
  );
}
