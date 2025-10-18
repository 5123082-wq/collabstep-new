import {
  applySpecialistFilters,
  buildSpecialistSearchParams,
  parseSpecialistFilters,
  type SpecialistFilters
} from '@/lib/marketplace/specialists';
import { SpecialistsSchema, type Specialist } from '@/lib/schemas/marketplace-specialist';

describe('marketplace specialists helpers', () => {
  const specialists: Specialist[] = [
    {
      id: 'spec-a',
      handle: 'alpha',
      name: 'Алина Коваль',
      role: 'Дизайнер',
      description: 'UX/UI специалист',
      skills: ['Figma', 'UX', 'Research'],
      rate: { min: 1500, max: 2000, currency: 'RUB', period: 'hour' },
      rating: 4.7,
      reviews: 12,
      languages: ['ru'],
      workFormats: ['remote'],
      experienceYears: 5,
      timezone: 'GMT+3',
      availability: ['Свободна 20 ч/нед'],
      engagement: ['Готова к проекту'],
      updatedAt: '2024-06-01'
    },
    {
      id: 'spec-b',
      handle: 'beta',
      name: 'Игорь Белов',
      role: 'Разработчик',
      description: 'Go и Kubernetes',
      skills: ['Go', 'Kubernetes'],
      rate: { min: 2500, max: 3200, currency: 'RUB', period: 'hour' },
      rating: 4.9,
      reviews: 30,
      languages: ['ru', 'en'],
      workFormats: ['office'],
      experienceYears: 8,
      timezone: 'GMT+3',
      availability: ['В офисе'],
      engagement: ['Свободен частично'],
      updatedAt: '2024-05-20'
    }
  ];

  it('парсит фильтры из query-параметров', () => {
    const params = new URLSearchParams({
      q: 'дизайн',
      role: 'Дизайнер',
      skills: 'Figma,Research',
      lang: 'ru',
      format: 'remote',
      rateMin: '1500',
      rateMax: '2200',
      sort: 'cost',
      page: '2'
    });

    const parsed = parseSpecialistFilters(params);
    expect(parsed).toEqual({
      query: 'дизайн',
      role: 'Дизайнер',
      skills: ['Figma', 'Research'],
      language: 'ru',
      workFormat: 'remote',
      rateMin: 1500,
      rateMax: 2200,
      sort: 'cost',
      page: 2
    });
  });

  it('обнуляет некорректные значения фильтров', () => {
    const params = new URLSearchParams({
      page: '-2',
      rateMin: 'abc',
      sort: 'unknown',
      format: 'any'
    });

    const parsed = parseSpecialistFilters(params);
    expect(parsed.page).toBe(1);
    expect(parsed.rateMin).toBeNull();
    expect(parsed.sort).toBe('rating');
    expect(parsed.workFormat).toBeNull();
  });

  it('сериализует фильтры в query-параметры', () => {
    const filters: SpecialistFilters = {
      query: 'pm',
      role: 'Разработчик',
      skills: ['Go'],
      language: 'en',
      workFormat: 'office',
      rateMin: 2000,
      rateMax: null,
      sort: 'new',
      page: 3
    };

    const params = buildSpecialistSearchParams(filters);
    expect(Object.fromEntries(params.entries())).toEqual({
      q: 'pm',
      role: 'Разработчик',
      skills: 'Go',
      lang: 'en',
      format: 'office',
      rateMin: '2000',
      sort: 'new',
      page: '3'
    });
  });

  it('применяет фильтры к каталогу', () => {
    const filters: SpecialistFilters = {
      query: 'дизайн',
      role: 'Дизайнер',
      skills: ['Figma'],
      language: 'ru',
      workFormat: 'remote',
      rateMin: 1400,
      rateMax: 2200,
      sort: 'rating',
      page: 1
    };

    const result = applySpecialistFilters(specialists, filters);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('spec-a');
  });

  it('сортирует по дате обновления при выборе режима new', () => {
    const filters: SpecialistFilters = {
      query: null,
      role: null,
      skills: [],
      language: null,
      workFormat: null,
      rateMin: null,
      rateMax: null,
      sort: 'new',
      page: 1
    };

    const result = applySpecialistFilters(specialists, filters);
    expect(result[0]?.id).toBe('spec-a');
  });

  it('валидирует корректные данные каталога', () => {
    const parsed = SpecialistsSchema.safeParse(specialists);
    expect(parsed.success).toBe(true);
  });

  it('отклоняет данные с некорректной ставкой', () => {
    const base = specialists[0]!;
    const invalid: Specialist[] = [
      {
        ...base,
        rate: { ...base.rate, min: 5000, max: 3000 }
      }
    ];

    const parsed = SpecialistsSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
