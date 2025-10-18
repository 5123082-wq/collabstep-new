import type { Specialist } from '@/lib/schemas/marketplace-specialist';

export type SpecialistSort = 'rating' | 'cost' | 'new';

export type SpecialistFilters = {
  query: string | null;
  role: string | null;
  skills: string[];
  language: string | null;
  workFormat: 'remote' | 'office' | 'hybrid' | null;
  rateMin: number | null;
  rateMax: number | null;
  sort: SpecialistSort;
  page: number;
};

export const DEFAULT_SPECIALIST_FILTERS: SpecialistFilters = {
  query: null,
  role: null,
  skills: [],
  language: null,
  workFormat: null,
  rateMin: null,
  rateMax: null,
  sort: 'rating',
  page: 1
};

function parseNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function sanitizePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function parseSort(value: string | null): SpecialistSort {
  if (value === 'cost' || value === 'new') {
    return value;
  }
  return 'rating';
}

export function parseSpecialistFilters(params: URLSearchParams): SpecialistFilters {
  const skillsParam = params.get('skills');
  const skills = skillsParam
    ? skillsParam
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  const workFormatParam = params.get('format');
  const workFormat = workFormatParam === 'remote' || workFormatParam === 'office' || workFormatParam === 'hybrid'
    ? workFormatParam
    : null;

  return {
    query: params.get('q')?.trim() || null,
    role: params.get('role')?.trim() || null,
    skills,
    language: params.get('lang')?.trim() || null,
    workFormat,
    rateMin: parseNumber(params.get('rateMin')),
    rateMax: parseNumber(params.get('rateMax')),
    sort: parseSort(params.get('sort')),
    page: sanitizePage(params.get('page'))
  };
}

export function buildSpecialistSearchParams(filters: SpecialistFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set('q', filters.query);
  }
  if (filters.role) {
    params.set('role', filters.role);
  }
  if (filters.skills.length > 0) {
    params.set('skills', filters.skills.join(','));
  }
  if (filters.language) {
    params.set('lang', filters.language);
  }
  if (filters.workFormat) {
    params.set('format', filters.workFormat);
  }
  if (filters.rateMin !== null) {
    params.set('rateMin', String(filters.rateMin));
  }
  if (filters.rateMax !== null) {
    params.set('rateMax', String(filters.rateMax));
  }
  if (filters.sort !== 'rating') {
    params.set('sort', filters.sort);
  }
  if (filters.page > 1) {
    params.set('page', String(filters.page));
  }

  return params;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function matchesQuery(specialist: Specialist, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalized = normalize(query);
  return [
    specialist.name,
    specialist.role,
    specialist.description,
    specialist.skills.join(' ')
  ]
    .map(normalize)
    .some((field) => field.includes(normalized));
}

function matchesSkills(specialist: Specialist, skills: string[]): boolean {
  if (skills.length === 0) {
    return true;
  }

  const specialistSkills = specialist.skills.map(normalize);
  return skills.every((skill) => specialistSkills.includes(normalize(skill)));
}

function matchesLanguage(specialist: Specialist, language: string | null): boolean {
  if (!language) {
    return true;
  }

  return specialist.languages.map(normalize).includes(normalize(language));
}

function matchesFormat(specialist: Specialist, workFormat: SpecialistFilters['workFormat']): boolean {
  if (!workFormat) {
    return true;
  }

  return specialist.workFormats.includes(workFormat);
}

function matchesRate(specialist: Specialist, rateMin: number | null, rateMax: number | null): boolean {
  if (rateMin !== null && specialist.rate.min < rateMin) {
    return false;
  }
  if (rateMax !== null && specialist.rate.max > rateMax) {
    return false;
  }
  return true;
}

export function applySpecialistFilters(items: Specialist[], filters: SpecialistFilters): Specialist[] {
  const filtered = items.filter((specialist) =>
    matchesQuery(specialist, filters.query ?? '') &&
    (filters.role ? normalize(specialist.role) === normalize(filters.role) : true) &&
    matchesSkills(specialist, filters.skills) &&
    matchesLanguage(specialist, filters.language) &&
    matchesFormat(specialist, filters.workFormat) &&
    matchesRate(specialist, filters.rateMin, filters.rateMax)
  );

  const sorted = [...filtered];
  if (filters.sort === 'cost') {
    sorted.sort((a, b) => a.rate.min - b.rate.min || a.rate.max - b.rate.max);
  } else if (filters.sort === 'new') {
    sorted.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  } else {
    sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  }

  return sorted;
}
