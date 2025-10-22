import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import {
  DEFAULT_WORKSPACE_USER_ID,
  projectCatalogService,
  projectsRepository,
  type ProjectCardFilters,
  type ProjectCardSort,
  type ProjectCardTab,
  type ProjectStage
} from '@collabverse/api';

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
    const legacyItems = projectCatalogService.getProjects({ archived: archivedFilter });
    return NextResponse.json({ items: legacyItems, total: legacyItems.length });
  }

  const tabParam = req.nextUrl.searchParams.get('tab');
  const tab: ProjectCardTab = tabParam === 'member' ? 'member' : 'mine';
  const query = req.nextUrl.searchParams.get('query');
  const sort = parseSort(req.nextUrl.searchParams.get('sort'));
  const filters = parseFiltersParam(req.nextUrl.searchParams.get('filters'));
  const page = Number.parseInt(req.nextUrl.searchParams.get('page') ?? '', 10);
  const pageSize = Number.parseInt(req.nextUrl.searchParams.get('pageSize') ?? '', 10);

  const { items, total } = projectCatalogService.getProjectCards({
    tab,
    currentUserId: DEFAULT_WORKSPACE_USER_ID,
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
  const project = projectsRepository.create({
    title: typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'Без названия',
    description: typeof body.description === 'string' ? body.description : '',
    ownerId:
      typeof body.ownerId === 'string' && body.ownerId.trim()
        ? body.ownerId
        : DEFAULT_WORKSPACE_USER_ID,
    stage,
    deadline: typeof body.deadline === 'string' && body.deadline ? body.deadline : undefined
  });

  return NextResponse.json(project, { status: 201 });
}
