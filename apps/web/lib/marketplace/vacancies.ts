import type { Vacancy } from '@/lib/schemas/marketplace-vacancy';

export type VacancyFilters = {
  query: string | null;
  role: string | null;
  level: 'Junior' | 'Middle' | 'Senior' | null;
  employment: 'project' | 'part-time' | 'full-time' | null;
  format: 'remote' | 'office' | 'hybrid' | null;
  rewardType: 'rate' | 'salary' | 'equity' | null;
  language: string | null;
  page: number;
};

export const DEFAULT_VACANCY_FILTERS: VacancyFilters = {
  query: null,
  role: null,
  level: null,
  employment: null,
  format: null,
  rewardType: null,
  language: null,
  page: 1
};

function sanitizePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function parseLevel(value: string | null): VacancyFilters['level'] {
  if (value === 'Junior' || value === 'Middle' || value === 'Senior') {
    return value;
  }
  return null;
}

function parseEmployment(value: string | null): VacancyFilters['employment'] {
  if (value === 'project' || value === 'part-time' || value === 'full-time') {
    return value;
  }
  return null;
}

function parseFormat(value: string | null): VacancyFilters['format'] {
  if (value === 'remote' || value === 'office' || value === 'hybrid') {
    return value;
  }
  return null;
}

function parseReward(value: string | null): VacancyFilters['rewardType'] {
  if (value === 'rate' || value === 'salary' || value === 'equity') {
    return value;
  }
  return null;
}

export function parseVacancyFilters(params: URLSearchParams): VacancyFilters {
  return {
    query: params.get('q')?.trim() || null,
    role: params.get('role')?.trim() || null,
    level: parseLevel(params.get('level')),
    employment: parseEmployment(params.get('employment')),
    format: parseFormat(params.get('format')),
    rewardType: parseReward(params.get('reward')),
    language: params.get('lang')?.trim() || null,
    page: sanitizePage(params.get('page'))
  };
}

export function buildVacancySearchParams(filters: VacancyFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set('q', filters.query);
  }
  if (filters.role) {
    params.set('role', filters.role);
  }
  if (filters.level) {
    params.set('level', filters.level);
  }
  if (filters.employment) {
    params.set('employment', filters.employment);
  }
  if (filters.format) {
    params.set('format', filters.format);
  }
  if (filters.rewardType) {
    params.set('reward', filters.rewardType);
  }
  if (filters.language) {
    params.set('lang', filters.language);
  }
  if (filters.page > 1) {
    params.set('page', String(filters.page));
  }

  return params;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function matchesQuery(vacancy: Vacancy, query: string): boolean {
  if (!query) {
    return true;
  }
  const normalized = normalize(query);
  return [vacancy.title, vacancy.summary, vacancy.project, vacancy.tags.join(' ')]
    .map(normalize)
    .some((field) => field.includes(normalized));
}

function matchesRole(vacancy: Vacancy, role: string | null): boolean {
  if (!role) {
    return true;
  }
  return normalize(vacancy.title) === normalize(role);
}

function matchesLevel(vacancy: Vacancy, level: VacancyFilters['level']): boolean {
  if (!level) {
    return true;
  }
  return vacancy.level === level;
}

function matchesEmployment(vacancy: Vacancy, employment: VacancyFilters['employment']): boolean {
  if (!employment) {
    return true;
  }
  return vacancy.employment === employment;
}

function matchesFormat(vacancy: Vacancy, format: VacancyFilters['format']): boolean {
  if (!format) {
    return true;
  }
  return vacancy.format.includes(format);
}

function matchesReward(vacancy: Vacancy, reward: VacancyFilters['rewardType']): boolean {
  if (!reward) {
    return true;
  }
  return vacancy.reward.type === reward;
}

function matchesLanguage(vacancy: Vacancy, language: string | null): boolean {
  if (!language) {
    return true;
  }
  return normalize(vacancy.language) === normalize(language);
}

export function applyVacancyFilters(items: Vacancy[], filters: VacancyFilters): Vacancy[] {
  const filtered = items.filter(
    (vacancy) =>
      matchesQuery(vacancy, filters.query ?? '') &&
      matchesRole(vacancy, filters.role) &&
      matchesLevel(vacancy, filters.level) &&
      matchesEmployment(vacancy, filters.employment) &&
      matchesFormat(vacancy, filters.format) &&
      matchesReward(vacancy, filters.rewardType) &&
      matchesLanguage(vacancy, filters.language)
  );

  return filtered
    .slice()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || Date.parse(a.deadline) - Date.parse(b.deadline));
}
