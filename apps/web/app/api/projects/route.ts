import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import {
  DEFAULT_WORKSPACE_ID,
  DEFAULT_WORKSPACE_USER_ID,
  memory,
  projectBudgetsRepository,
  projectCatalogService,
  projectsRepository,
  type ProjectCardFilters,
  type ProjectCardSort,
  type ProjectCardTab,
  type ProjectStage,
  type ProjectType,
  type ProjectVisibility,
  type TaskStatus
} from '@collabverse/api';
import { workspacesRepository } from '@collabverse/api';
import { recordAudit } from '@/lib/audit/log';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

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

const allowedWorkflowStatuses: TaskStatus[] = ['new', 'in_progress', 'review', 'done', 'blocked'];

function parseBudgetValue(input: unknown): number | null {
  if (input === null) {
    return null;
  }
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }
  if (typeof input === 'string') {
    const normalized = input.trim().replace(',', '.');
    if (!normalized) {
      return null;
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseSort(value: string | null): ProjectCardSort | null {
  if (!value) {
    return null;
  }
  const allowed: ProjectCardSort[] = [
    'updated-desc',
    'updated-asc',
    'deadline-asc',
    'deadline-desc',
    'progress-asc',
    'progress-desc',
    'alphabetical'
  ];
  return allowed.includes(value as ProjectCardSort) ? (value as ProjectCardSort) : null;
}

function parseFiltersParam(value: string | null): ProjectCardFilters | null {
  if (!value) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as ProjectCardFilters;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const result: ProjectCardFilters = {};
    if (parsed.status === 'archived' || parsed.status === 'active' || parsed.status === 'all') {
      result.status = parsed.status;
    }
    if (Array.isArray(parsed.ownerIds)) {
      result.ownerIds = parsed.ownerIds.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      );
    }
    if (Array.isArray(parsed.memberIds)) {
      result.memberIds = parsed.memberIds.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      );
    }
    if (Array.isArray(parsed.tags)) {
      result.tags = parsed.tags.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
    if (parsed.dateField === 'createdAt' || parsed.dateField === 'deadline') {
      result.dateField = parsed.dateField;
    }
    if (typeof parsed.dateFrom === 'string') {
      result.dateFrom = parsed.dateFrom;
    }
    if (typeof parsed.dateTo === 'string') {
      result.dateTo = parsed.dateTo;
    }
    if (Array.isArray(parsed.workspaceIds)) {
      result.workspaceIds = parsed.workspaceIds.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      );
    }
    if (parsed.visibility === 'public' || parsed.visibility === 'private') {
      result.visibility = parsed.visibility;
    }
    if (Array.isArray(parsed.types)) {
      const allowedTypes: ProjectType[] = ['product', 'marketing', 'operations', 'service', 'internal'];
      result.types = parsed.types.filter(
        (item): item is ProjectType => typeof item === 'string' && allowedTypes.includes(item as ProjectType)
      );
    }
    return result;
  } catch (err) {
    console.warn('Failed to parse project filters', err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const archivedFilter = parseArchivedFilter(req.nextUrl.searchParams.get('archived'));
  if (
    archivedFilter !== null &&
    !req.nextUrl.searchParams.has('tab') &&
    !req.nextUrl.searchParams.has('filters') &&
    !req.nextUrl.searchParams.has('query')
  ) {
    // Get current user from session
    const session = getDemoSessionFromCookies();
    const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;
    const legacyItems = projectCatalogService.getProjects({ archived: archivedFilter, currentUserId });
    return NextResponse.json({ items: legacyItems, total: legacyItems.length });
  }

  const tabParam = req.nextUrl.searchParams.get('tab');
  const tab: ProjectCardTab =
    tabParam === 'member' || tabParam === 'mine' || tabParam === 'all'
      ? tabParam
      : 'all';
  const query = req.nextUrl.searchParams.get('query');
  const sort = parseSort(req.nextUrl.searchParams.get('sort'));
  const filters = parseFiltersParam(req.nextUrl.searchParams.get('filters'));
  const page = Number.parseInt(req.nextUrl.searchParams.get('page') ?? '', 10);
  const pageSize = Number.parseInt(req.nextUrl.searchParams.get('pageSize') ?? '', 10);

  // Get current user from session
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;

  const { items, total } = projectCatalogService.getProjectCards({
    tab,
    currentUserId,
    query,
    sort,
    filters,
    page: Number.isFinite(page) ? page : null,
    pageSize: Number.isFinite(pageSize) ? pageSize : null
  });

  return NextResponse.json({ items, total });
}

export async function POST(req: NextRequest) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const allowedStages: ProjectStage[] = ['discovery', 'design', 'build', 'launch', 'support'];
  const requestedStage = typeof body.stage === 'string' ? (body.stage as ProjectStage) : undefined;
  const stage = requestedStage && allowedStages.includes(requestedStage) ? requestedStage : 'discovery';
  const allowedTypes: ProjectType[] = ['product', 'marketing', 'operations', 'service', 'internal'];
  const requestedType = typeof body.type === 'string' ? (body.type as ProjectType) : undefined;
  const type = requestedType && allowedTypes.includes(requestedType) ? requestedType : 'internal';
  const visibility: ProjectVisibility = body.visibility === 'public' ? 'public' : 'private';
  const requestedWorkspaceId =
    typeof body.workspaceId === 'string' && body.workspaceId.trim() ? body.workspaceId.trim() : DEFAULT_WORKSPACE_ID;
  const workspace = workspacesRepository.findById(requestedWorkspaceId);
  const workspaceId = workspace ? workspace.id : DEFAULT_WORKSPACE_ID;
  const workflowStatusesInput = Array.isArray(body.workflow?.statuses)
    ? body.workflow.statuses.filter((status: unknown): status is TaskStatus =>
        typeof status === 'string' && allowedWorkflowStatuses.includes(status as TaskStatus)
      )
    : [];
  const normalizedWorkflow: TaskStatus[] =
    workflowStatusesInput.length >= 3
      ? Array.from(new Set(workflowStatusesInput))
      : ['new', 'in_progress', 'review', 'done'];
  const workflowId = typeof body.workflow?.id === 'string' && body.workflow.id ? body.workflow.id : undefined;

  const requestedBudget = parseBudgetValue(body.budgetPlanned);
  const financeBudget = parseBudgetValue(body.finance?.budget ?? null);
  const budgetPlanned = requestedBudget !== null ? requestedBudget : financeBudget;
  const budgetSpent = parseBudgetValue(body.budgetSpent);

  const project = projectsRepository.create({
    title: typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'Без названия',
    description: typeof body.description === 'string' ? body.description : '',
    ownerId:
      typeof body.ownerId === 'string' && body.ownerId.trim()
        ? body.ownerId
        : DEFAULT_WORKSPACE_USER_ID,
    workspaceId,
    stage,
    deadline: typeof body.deadline === 'string' && body.deadline ? body.deadline : undefined,
    type,
    visibility,
    workflowId,
    budgetPlanned,
    budgetSpent
  });

  memory.WORKFLOWS[project.id] = {
    projectId: project.id,
    statuses: normalizedWorkflow
  };

  if (body.finance?.budget || body.finance?.currency || budgetPlanned !== null) {
    const plannedFromFinance =
      typeof body.finance?.budget === 'string' && body.finance?.budget ? body.finance.budget : null;
    const currency =
      typeof body.finance?.currency === 'string' && body.finance?.currency
        ? body.finance.currency.toUpperCase()
        : null;
    if (currency) {
      const planned = plannedFromFinance ?? (budgetPlanned !== null ? budgetPlanned.toFixed(2) : null);
      const budget = {
        projectId: project.id,
        currency,
        updatedAt: new Date().toISOString(),
        ...(planned ? { total: planned } : {})
      };
      projectBudgetsRepository.upsert(budget);
    }
  }

  recordAudit({
    action: 'project.created',
    entity: { type: 'project', id: project.id },
    projectId: project.id,
    workspaceId: project.workspaceId,
    after: project
  });

  return NextResponse.json(project, { status: 201 });
}
