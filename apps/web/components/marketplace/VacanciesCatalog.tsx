'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Vacancy } from '@/lib/schemas/marketplace-vacancy';
import {
  applyVacancyFilters,
  buildVacancySearchParams,
  DEFAULT_VACANCY_FILTERS,
  parseVacancyFilters,
  type VacancyFilters
} from '@/lib/marketplace/vacancies';
import { useDebouncedValue } from '@/lib/ui/useDebouncedValue';
import { toast } from '@/lib/ui/toast';
import { EmptyState, ErrorState } from '@/components/marketplace/FeedbackState';

const ITEMS_PER_PAGE = 8;

const EMPLOYMENT_LABEL: Record<'project' | 'part-time' | 'full-time', string> = {
  project: 'Проектная занятость',
  'part-time': 'Частичная занятость',
  'full-time': 'Полная занятость'
};

const FORMAT_LABEL: Record<'remote' | 'office' | 'hybrid', string> = {
  remote: 'Удалённо',
  office: 'В офисе',
  hybrid: 'Гибрид'
};

const SEARCH_PLACEHOLDER = 'Например: дизайн или Python';

const numberFormatter = new Intl.NumberFormat('ru-RU');
const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

function currencySymbol(currency: string): string {
  if (currency === 'RUB') {
    return '₽';
  }
  if (currency === 'USD') {
    return '$';
  }
  if (currency === 'EUR') {
    return '€';
  }
  return currency;
}

function formatPeriod(period: 'hour' | 'day' | 'project'): string {
  if (period === 'hour') {
    return 'час';
  }
  if (period === 'day') {
    return 'день';
  }
  return 'проект';
}

function formatReward(reward: Vacancy['reward']): string {
  if (reward.type === 'rate') {
    const symbol = currencySymbol(reward.currency);
    if (reward.min === reward.max) {
      return `${numberFormatter.format(reward.min)} ${symbol}/${formatPeriod(reward.period)}`;
    }
    return `${numberFormatter.format(reward.min)} – ${numberFormatter.format(reward.max)} ${symbol}/${formatPeriod(reward.period)}`;
  }
  if (reward.type === 'salary') {
    const symbol = currencySymbol(reward.currency);
    return `${numberFormatter.format(reward.amount)} ${symbol}/мес.`;
  }
  return `Доля ${reward.share}`;
}

function formatDeadline(date: string): string {
  return dateFormatter.format(new Date(date));
}

function cloneFilters(filters: VacancyFilters): VacancyFilters {
  return { ...filters };
}

function areFiltersEqual(a: VacancyFilters, b: VacancyFilters): boolean {
  return (
    a.query === b.query &&
    a.role === b.role &&
    a.level === b.level &&
    a.employment === b.employment &&
    a.format === b.format &&
    a.rewardType === b.rewardType &&
    a.language === b.language &&
    a.page === b.page
  );
}

type VacanciesCatalogProps = {
  data: Vacancy[];
  error: string | null;
};

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
};

function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return (
    <nav aria-label="Пагинация вакансий" className="flex items-center justify-between rounded-2xl border border-neutral-900 bg-neutral-950/60 px-4 py-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-300 transition hover:border-indigo-500/40 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-900 disabled:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        aria-label="Предыдущая страница"
      >
        Назад
      </button>
      <div className="flex items-center gap-2">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            className={`rounded-xl border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
              page === currentPage
                ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-100'
                : 'border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-indigo-500/40 hover:text-white'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-300 transition hover:border-indigo-500/40 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-900 disabled:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        aria-label="Следующая страница"
      >
        Вперёд
      </button>
    </nav>
  );
}

function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  return (
    <article className="flex h-full flex-col justify-between rounded-3xl border border-neutral-900 bg-neutral-950/70 p-6 shadow-sm shadow-neutral-950/20 transition hover:border-indigo-500/40">
      <div className="space-y-3">
        <header>
          <p className="text-xs uppercase tracking-wide text-indigo-300">{vacancy.project}</p>
          <h3 className="mt-1 text-lg font-semibold text-neutral-50">{vacancy.title}</h3>
        </header>
        <p className="text-sm text-neutral-300">{vacancy.summary}</p>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
          {vacancy.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
        <dl className="grid gap-2 text-sm text-neutral-300">
          <div className="flex flex-wrap gap-2">
            <dt className="font-semibold text-neutral-200">Уровень:</dt>
            <dd>{vacancy.level}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-semibold text-neutral-200">Занятость:</dt>
            <dd>{EMPLOYMENT_LABEL[vacancy.employment]}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-semibold text-neutral-200">Формат:</dt>
            <dd className="flex flex-wrap gap-2">
              {vacancy.format.map((format) => (
                <span key={format} className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-300">
                  {FORMAT_LABEL[format]}
                </span>
              ))}
            </dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-semibold text-neutral-200">Вознаграждение:</dt>
            <dd>{formatReward(vacancy.reward)}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-semibold text-neutral-200">Дедлайн:</dt>
            <dd>{formatDeadline(vacancy.deadline)}</dd>
          </div>
        </dl>
      </div>
      <footer className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => toast('Перейдите в карточку вакансии, чтобы отправить отклик')}
          className="rounded-xl border border-indigo-500/50 bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Откликнуться
        </button>
        <button
          type="button"
          onClick={() => toast('Вакансия сохранена в подборку (mock)')}
          className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={() => toast('Подписка на обновления оформлена (mock)')}
          className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Подписаться
        </button>
        <Link
          href={`/app/marketplace/vacancies/${vacancy.id}`}
          className="ml-auto rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Подробнее
        </Link>
      </footer>
    </article>
  );
}

export default function VacanciesCatalog({ data, error }: VacanciesCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<VacancyFilters>(() => cloneFilters(DEFAULT_VACANCY_FILTERS));
  const filtersRef = useRef<VacancyFilters>(cloneFilters(DEFAULT_VACANCY_FILTERS));
  const [searchDraft, setSearchDraft] = useState('');
  const [isReady, setIsReady] = useState(false);
  const lastQueryRef = useRef<string>('');
  const debouncedQuery = useDebouncedValue(searchDraft, 400);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentQuery = searchParams.toString();

    if (!isReady) {
      const initialFilters = cloneFilters(parseVacancyFilters(searchParams));
      filtersRef.current = initialFilters;
      setFilters(initialFilters);
      setSearchDraft(initialFilters.query ?? '');
      lastQueryRef.current = currentQuery;
      setIsReady(true);
      return;
    }

    if (lastQueryRef.current === currentQuery) {
      return;
    }

    const nextFilters = cloneFilters(parseVacancyFilters(searchParams));
    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    setSearchDraft(nextFilters.query ?? '');
    lastQueryRef.current = currentQuery;
  }, [isReady, searchParams]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    setSearchDraft(filters.query ?? '');
  }, [filters.query, isReady]);

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.requestAnimationFrame(() => {
      const target = listRef.current;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }, []);

  const applyFiltersState = useCallback(
    (nextFilters: VacancyFilters, options: { scroll?: boolean } = {}) => {
      const normalized = cloneFilters(nextFilters);
      const params = buildVacancySearchParams(normalized);
      const nextQuery = params.toString();
      const currentQuery = lastQueryRef.current;
      const sameFilters = areFiltersEqual(filtersRef.current, normalized);
      const sameQuery = currentQuery === nextQuery;

      if (sameFilters && sameQuery) {
        return;
      }

      filtersRef.current = normalized;
      setFilters(normalized);

      if (!sameQuery) {
        lastQueryRef.current = nextQuery;
        startTransition(() => {
          router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
        });
      }

      if (options.scroll !== false) {
        scrollToTop();
      }
    },
    [pathname, router, scrollToTop, startTransition]
  );

  const updateFilters = useCallback(
    (patch: Partial<VacancyFilters>, options: { resetPage?: boolean; scroll?: boolean } = {}) => {
      if (!isReady) {
        return;
      }

      const current = filtersRef.current;
      const merged: VacancyFilters = {
        ...current,
        ...patch
      };

      if (options.resetPage !== false) {
        merged.page = 1;
      }

      applyFiltersState(merged, options);
    },
    [applyFiltersState, isReady]
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const normalized = filters.query ?? '';
    if (debouncedQuery === normalized) {
      return;
    }
    const value = debouncedQuery.trim();
    updateFilters({ query: value || null });
  }, [debouncedQuery, filters.query, isReady, updateFilters]);

  const filteredItems = useMemo(() => applyVacancyFilters(data, filters), [data, filters]);
  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const currentPage = Math.min(filters.page, totalPages);
  const pageItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredItems, currentPage]
  );

  useEffect(() => {
    if (filters.page > totalPages) {
      updateFilters({ page: totalPages }, { resetPage: false, scroll: false });
    }
  }, [filters.page, totalPages, updateFilters]);

  const roles = useMemo(
    () => Array.from(new Set(data.map((item) => item.title))).sort((a, b) => a.localeCompare(b, 'ru-RU')),
    [data]
  );
  const languages = useMemo(
    () => Array.from(new Set(data.map((item) => item.language))).sort((a, b) => a.localeCompare(b, 'ru-RU')),
    [data]
  );

  if (error) {
    return <ErrorState message="Не удалось загрузить вакансии. Попробуйте обновить страницу." />;
  }

  const handleReset = () => {
    if (!isReady) {
      return;
    }
    applyFiltersState(cloneFilters(DEFAULT_VACANCY_FILTERS));
  };

  return (
    <section className="space-y-6" aria-live="polite" data-page-ready={isReady ? 'true' : 'false'}>
      <div className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-neutral-100">Каталог вакансий</h2>
            <p className="text-sm text-neutral-400">Подберите задачи по роли, уровню, формату и типу вознаграждения.</p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            aria-controls="results"
          >
            Сбросить фильтры
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Роль</span>
            <select
              value={filters.role ?? ''}
              onChange={(event) => updateFilters({ role: event.target.value || null })}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Все роли</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Уровень</span>
            <select
              value={filters.level ?? ''}
              onChange={(event) => updateFilters({ level: (event.target.value as VacancyFilters['level']) || null })}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Любой уровень</option>
              <option value="Junior">Junior</option>
              <option value="Middle">Middle</option>
              <option value="Senior">Senior</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Язык</span>
            <select
              value={filters.language ?? ''}
              onChange={(event) => updateFilters({ language: event.target.value || null })}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Все языки</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Тип занятости</span>
            <select
              value={filters.employment ?? ''}
              onChange={(event) => updateFilters({ employment: (event.target.value as VacancyFilters['employment']) || null })}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Любой</option>
              <option value="project">Проектная</option>
              <option value="part-time">Частичная</option>
              <option value="full-time">Полная</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Формат</span>
            <select
              value={filters.format ?? ''}
              onChange={(event) => updateFilters({ format: (event.target.value as VacancyFilters['format']) || null })}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Любой</option>
              <option value="remote">Удалённо</option>
              <option value="office">В офисе</option>
              <option value="hybrid">Гибрид</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Вознаграждение</span>
            <select
              value={filters.rewardType ?? ''}
              onChange={(event) => updateFilters({ rewardType: (event.target.value as VacancyFilters['rewardType']) || null })}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Все варианты</option>
              <option value="rate">Ставка</option>
              <option value="salary">Зарплата</option>
              <option value="equity">Доля</option>
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-neutral-300 md:col-span-3">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Поиск</span>
            <input
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder={SEARCH_PLACEHOLDER}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            />
          </label>
        </div>
      </div>

      <div ref={listRef} className="flex items-center justify-between text-sm text-neutral-400">
        <p>
          Найдено вакансий: <span className="font-semibold text-neutral-100">{total}</span>
        </p>
        {isPending && <p className="text-xs text-indigo-300">Обновляем результаты…</p>}
      </div>

      <div id="results">
        {pageItems.length === 0 ? (
          <EmptyState message="Ничего не найдено. Измените фильтры." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {pageItems.map((vacancy) => (
              <VacancyCard key={vacancy.id} vacancy={vacancy} />
            ))}
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={(page) => updateFilters({ page }, { resetPage: false })} />
    </section>
  );
}
