import {
  DEFAULT_WORKSPACE_ID,
  type ProjectCard,
  type ProjectCardFilters as ApiProjectCardFilters,
  type ProjectCardSort,
  type ProjectCardTab
} from '@collabverse/api';

export type ProjectsOverviewTab = ProjectCardTab;
export type ProjectsOverviewSort = ProjectCardSort;

export interface ProjectsOverviewFilters {
  status: 'all' | 'active' | 'archived';
  owners: string[];
  participants: string[];
  tags: string[];
  dateField: 'createdAt' | 'deadline';
  dateFrom: string | null;
  dateTo: string | null;
}

export interface ProjectsOverviewState {
  tab: ProjectsOverviewTab;
  query: string;
  sort: ProjectsOverviewSort;
  filters: ProjectsOverviewFilters;
}

export interface SelectOption {
  id: string;
  label: string;
}

export const DEFAULT_SORT: ProjectsOverviewSort = 'updated-desc';
export const DEFAULT_TAB: ProjectsOverviewTab = 'all';

export const DEFAULT_FILTERS: ProjectsOverviewFilters = {
  status: 'all',
  owners: [],
  participants: [],
  tags: [],
  dateField: 'createdAt',
  dateFrom: null,
  dateTo: null
};

export function createDefaultState(): ProjectsOverviewState {
  return {
    tab: DEFAULT_TAB,
    query: '',
    sort: DEFAULT_SORT,
    filters: { ...DEFAULT_FILTERS }
  };
}

function cloneFilters(filters: ProjectsOverviewFilters): ProjectsOverviewFilters {
  return {
    status: filters.status,
    owners: [...filters.owners],
    participants: [...filters.participants],
    tags: [...filters.tags],
    dateField: filters.dateField,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo
  };
}

function isNonEmpty(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function decodeFiltersParam(value: string | null): ProjectsOverviewFilters {
  if (!value) {
    return cloneFilters(DEFAULT_FILTERS);
  }
  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as ApiProjectCardFilters;
    if (!parsed || typeof parsed !== 'object') {
      return cloneFilters(DEFAULT_FILTERS);
    }
    const next: ProjectsOverviewFilters = cloneFilters(DEFAULT_FILTERS);
    if (parsed.status === 'archived' || parsed.status === 'active' || parsed.status === 'all') {
      next.status = parsed.status;
    }
    if (Array.isArray(parsed.ownerIds)) {
      next.owners = parsed.ownerIds.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
    if (Array.isArray(parsed.memberIds)) {
      next.participants = parsed.memberIds.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      );
    }
    if (Array.isArray(parsed.tags)) {
      next.tags = parsed.tags.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
    if (parsed.dateField === 'createdAt' || parsed.dateField === 'deadline') {
      next.dateField = parsed.dateField;
    }
    if (isNonEmpty(parsed.dateFrom ?? null)) {
      next.dateFrom = parsed.dateFrom ?? null;
    }
    if (isNonEmpty(parsed.dateTo ?? null)) {
      next.dateTo = parsed.dateTo ?? null;
    }
    return next;
  } catch (err) {
    console.warn('[projects-overview] failed to decode filters', err);
    return cloneFilters(DEFAULT_FILTERS);
  }
}

export function encodeFiltersParam(filters: ProjectsOverviewFilters): string | null {
  const base: ApiProjectCardFilters = {};
  if (filters.status !== 'all') {
    base.status = filters.status;
  }
  if (filters.owners.length > 0) {
    base.ownerIds = filters.owners;
  }
  if (filters.participants.length > 0) {
    base.memberIds = filters.participants;
  }
  if (filters.tags.length > 0) {
    base.tags = filters.tags;
  }
  if (filters.dateField !== 'createdAt') {
    base.dateField = filters.dateField;
  }
  if (isNonEmpty(filters.dateFrom)) {
    base.dateFrom = filters.dateFrom;
  }
  if (isNonEmpty(filters.dateTo)) {
    base.dateTo = filters.dateTo;
  }
  if (
    !base.status &&
    !base.ownerIds &&
    !base.memberIds &&
    !base.tags &&
    !base.dateField &&
    !base.dateFrom &&
    !base.dateTo
  ) {
    return null;
  }
  return encodeURIComponent(JSON.stringify(base));
}

export function parseStateFromSearchParams(params: URLSearchParams): ProjectsOverviewState {
  const base = createDefaultState();
  const tabParam = params.get('tab');
  if (tabParam === 'member' || tabParam === 'mine' || tabParam === 'all') {
    base.tab = tabParam;
  } else {
    base.tab = DEFAULT_TAB;
  }
  base.query = params.get('query') ?? '';
  const sortParam = params.get('sort');
  const allowedSorts: ProjectsOverviewSort[] = [
    'updated-desc',
    'updated-asc',
    'deadline-asc',
    'deadline-desc',
    'progress-asc',
    'progress-desc',
    'alphabetical'
  ];
  base.sort = allowedSorts.includes(sortParam as ProjectsOverviewSort)
    ? (sortParam as ProjectsOverviewSort)
    : DEFAULT_SORT;
  base.filters = decodeFiltersParam(params.get('filters'));
  return base;
}

export function buildSearchParams(state: ProjectsOverviewState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.tab !== DEFAULT_TAB) {
    params.set('tab', state.tab);
  }
  if (state.query.trim().length > 0) {
    params.set('query', state.query.trim());
  }
  if (state.sort !== DEFAULT_SORT) {
    params.set('sort', state.sort);
  }
  const encodedFilters = encodeFiltersParam(state.filters);
  if (encodedFilters) {
    params.set('filters', encodedFilters);
  }
  return params;
}

export function isFiltersEqual(a: ProjectsOverviewFilters, b: ProjectsOverviewFilters): boolean {
  return (
    a.status === b.status &&
    a.dateField === b.dateField &&
    a.dateFrom === b.dateFrom &&
    a.dateTo === b.dateTo &&
    a.owners.join('|') === b.owners.join('|') &&
    a.participants.join('|') === b.participants.join('|') &&
    a.tags.join('|') === b.tags.join('|')
  );
}

export function isStateEqual(a: ProjectsOverviewState, b: ProjectsOverviewState): boolean {
  return a.tab === b.tab && a.query === b.query && a.sort === b.sort && isFiltersEqual(a.filters, b.filters);
}

export function createApiFilters(filters: ProjectsOverviewFilters): ApiProjectCardFilters {
  const payload: ApiProjectCardFilters = {};
  if (filters.status !== 'all') {
    payload.status = filters.status;
  }
  if (filters.owners.length > 0) {
    payload.ownerIds = [...filters.owners];
  }
  if (filters.participants.length > 0) {
    payload.memberIds = [...filters.participants];
  }
  if (filters.tags.length > 0) {
    payload.tags = [...filters.tags];
  }
  payload.dateField = filters.dateField;
  if (filters.dateFrom) {
    payload.dateFrom = filters.dateFrom;
  }
  if (filters.dateTo) {
    payload.dateTo = filters.dateTo;
  }
  return payload;
}

function uniqueOptions(items: SelectOption[]): SelectOption[] {
  const map = new Map<string, SelectOption>();
  for (const item of items) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'ru'));
}

export function buildOwnerOptions(cards: ProjectCard[]): SelectOption[] {
  return uniqueOptions(
    cards.map((card) => ({ id: card.owner.id, label: card.owner.name || card.owner.email || card.owner.id }))
  );
}

export function buildParticipantOptions(cards: ProjectCard[]): SelectOption[] {
  const options: SelectOption[] = [];
  for (const card of cards) {
    for (const member of card.members) {
      options.push({ id: member.id, label: member.name || member.email || member.id });
    }
  }
  return uniqueOptions(options);
}

export function buildTagOptions(cards: ProjectCard[]): string[] {
  const set = new Set<string>();
  for (const card of cards) {
    for (const tag of card.tags) {
      if (tag.trim()) {
        set.add(tag);
      }
    }
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b, 'ru'));
}

export function mapProjectCard(dto: ProjectCard): ProjectCard {
  return {
    ...dto,
    workspace: dto.workspace ?? { id: DEFAULT_WORKSPACE_ID, name: 'Рабочее пространство' },
    description: dto.description ?? '',
    visibility: dto.visibility ?? 'private',
    type: dto.type ?? 'internal',
    members: dto.members ?? [],
    tags: dto.tags ?? [],
    tasks: {
      total: dto.tasks.total ?? 0,
      overdue: dto.tasks.overdue ?? 0,
      important: dto.tasks.important ?? 0,
      completed: dto.tasks.completed ?? 0
    },
    budget: dto.budget ?? { planned: null, spent: null },
    permissions: {
      // [PLAN:S2-120] Гарантируем предсказуемые ACL в клиенте.
      canArchive: dto.permissions?.canArchive ?? false,
      canInvite: dto.permissions?.canInvite ?? false,
      canCreateTask: dto.permissions?.canCreateTask ?? false,
      canView: dto.permissions?.canView ?? true
    }
  };
}
