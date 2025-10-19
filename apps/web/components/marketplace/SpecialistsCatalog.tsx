'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Specialist } from '@/lib/schemas/marketplace-specialist';
import {
  applySpecialistFilters,
  buildSpecialistSearchParams,
  DEFAULT_SPECIALIST_FILTERS,
  parseSpecialistFilters,
  type SpecialistFilters
} from '@/lib/marketplace/specialists';
import { useDebouncedValue } from '@/lib/ui/useDebouncedValue';
import { toast } from '@/lib/ui/toast';
import { EmptyState, ErrorState } from '@/components/marketplace/FeedbackState';

const ITEMS_PER_PAGE = 9;

const WORK_FORMAT_LABEL: Record<'remote' | 'office' | 'hybrid', string> = {
  remote: 'Удалённо',
  office: 'В офисе',
  hybrid: 'Гибрид'
};

const SEARCH_PLACEHOLDER = 'Например: дизайн или Python';

const numberFormatter = new Intl.NumberFormat('ru-RU');

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

function formatRate(rate: Specialist['rate']): string {
  const symbol = currencySymbol(rate.currency);
  if (rate.min === rate.max) {
    return `${numberFormatter.format(rate.min)} ${symbol}/${formatPeriod(rate.period)}`;
  }
  return `${numberFormatter.format(rate.min)} – ${numberFormatter.format(rate.max)} ${symbol}/${formatPeriod(rate.period)}`;
}

function cloneFilters(filters: SpecialistFilters): SpecialistFilters {
  return {
    ...filters,
    skills: [...filters.skills]
  };
}

function areFiltersEqual(a: SpecialistFilters, b: SpecialistFilters): boolean {
  if (
    a.query !== b.query ||
    a.role !== b.role ||
    a.language !== b.language ||
    a.workFormat !== b.workFormat ||
    a.rateMin !== b.rateMin ||
    a.rateMax !== b.rateMax ||
    a.sort !== b.sort ||
    a.page !== b.page
  ) {
    return false;
  }

  if (a.skills.length !== b.skills.length) {
    return false;
  }

  return a.skills.every((skill, index) => skill === b.skills[index]);
}

type SpecialistsCatalogProps = {
  data: Specialist[];
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
    <nav aria-label="Пагинация" className="flex items-center justify-between rounded-2xl border border-neutral-900 bg-neutral-950/60 px-4 py-3">
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

function SpecialistCard({ specialist }: { specialist: Specialist }) {
  return (
    <article className="rounded-3xl border border-neutral-900 bg-neutral-950/70 p-6 shadow-sm shadow-neutral-950/20 transition hover:border-indigo-500/40">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-neutral-50">{specialist.name}</h3>
          <p className="text-sm text-neutral-400">{specialist.role}</p>
        </div>
        <div className="text-right text-sm text-neutral-300">
          <p>
            <span aria-hidden="true">★</span> {specialist.rating.toFixed(1)}
          </p>
          <p className="text-xs text-neutral-500">{specialist.reviews} отзывов</p>
        </div>
      </header>
      <p className="mt-4 text-sm text-neutral-300">{specialist.description}</p>
      <dl className="mt-4 space-y-2 text-sm text-neutral-300">
        <div className="flex flex-wrap items-center gap-2">
          <dt className="font-semibold text-neutral-200">Навыки:</dt>
          <dd className="flex flex-wrap gap-2">
            {specialist.skills.map((skill) => (
              <span key={skill} className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                {skill}
              </span>
            ))}
          </dd>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <dt className="font-semibold text-neutral-200">Ставка:</dt>
          <dd>{formatRate(specialist.rate)}</dd>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <dt className="font-semibold text-neutral-200">Формат:</dt>
          <dd className="flex flex-wrap gap-2">
            {specialist.workFormats.map((format) => (
              <span key={format} className="rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300">
                {WORK_FORMAT_LABEL[format]}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-400">
        {specialist.availability.map((item) => (
          <span key={item} className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1">
            {item}
          </span>
        ))}
        {specialist.engagement.map((item) => (
          <span key={item} className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1">
            {item}
          </span>
        ))}
      </div>
      <footer className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => toast(`Приглашение отправлено ${specialist.name}`)}
          className="rounded-xl border border-indigo-500/50 bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Пригласить
        </button>
        <button
          type="button"
          onClick={() => toast(`Запрос на интервью отправлен ${specialist.name}`)}
          className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Запросить интервью
        </button>
        <Link
          href={`/p/${specialist.handle}`}
          className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Открыть визитку
        </Link>
      </footer>
    </article>
  );
}

export default function SpecialistsCatalog({ data, error }: SpecialistsCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<SpecialistFilters>(() => cloneFilters(DEFAULT_SPECIALIST_FILTERS));
  const filtersRef = useRef<SpecialistFilters>(cloneFilters(DEFAULT_SPECIALIST_FILTERS));
  const [searchDraft, setSearchDraft] = useState('');
  const [rateMinDraft, setRateMinDraft] = useState('');
  const [rateMaxDraft, setRateMaxDraft] = useState('');
  const [isReady, setIsReady] = useState(false);
  const lastQueryRef = useRef<string>('');
  const debouncedQuery = useDebouncedValue(searchDraft, 400);
  const debouncedRateMin = useDebouncedValue(rateMinDraft, 400);
  const debouncedRateMax = useDebouncedValue(rateMaxDraft, 400);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentQuery = searchParams.toString();

    if (!isReady) {
      const initialFilters = cloneFilters(parseSpecialistFilters(searchParams));
      filtersRef.current = initialFilters;
      setFilters(initialFilters);
      setSearchDraft(initialFilters.query ?? '');
      setRateMinDraft(initialFilters.rateMin !== null ? String(initialFilters.rateMin) : '');
      setRateMaxDraft(initialFilters.rateMax !== null ? String(initialFilters.rateMax) : '');
      lastQueryRef.current = currentQuery;
      setIsReady(true);
      return;
    }

    if (lastQueryRef.current === currentQuery) {
      return;
    }

    const nextFilters = cloneFilters(parseSpecialistFilters(searchParams));
    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    setSearchDraft(nextFilters.query ?? '');
    setRateMinDraft(nextFilters.rateMin !== null ? String(nextFilters.rateMin) : '');
    setRateMaxDraft(nextFilters.rateMax !== null ? String(nextFilters.rateMax) : '');
    lastQueryRef.current = currentQuery;
  }, [isReady, searchParams]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    setSearchDraft(filters.query ?? '');
  }, [filters.query, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    setRateMinDraft(filters.rateMin !== null ? String(filters.rateMin) : '');
  }, [filters.rateMin, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    setRateMaxDraft(filters.rateMax !== null ? String(filters.rateMax) : '');
  }, [filters.rateMax, isReady]);

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
    (nextFilters: SpecialistFilters, options: { scroll?: boolean } = {}) => {
      const normalized = cloneFilters(nextFilters);
      const params = buildSpecialistSearchParams(normalized);
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
    (patch: Partial<SpecialistFilters>, options: { resetPage?: boolean; scroll?: boolean } = {}) => {
      if (!isReady) {
        return;
      }

      const current = filtersRef.current;
      const merged: SpecialistFilters = {
        ...current,
        ...patch,
        skills: patch.skills ? [...patch.skills] : current.skills
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

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const currentRate = filters.rateMin !== null ? String(filters.rateMin) : '';
    if (debouncedRateMin === currentRate) {
      return;
    }
    const parsed = debouncedRateMin ? Number.parseInt(debouncedRateMin, 10) : null;
    if (debouncedRateMin && Number.isNaN(parsed)) {
      return;
    }
    updateFilters({ rateMin: parsed }, { scroll: false });
  }, [debouncedRateMin, filters.rateMin, isReady, updateFilters]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const currentRate = filters.rateMax !== null ? String(filters.rateMax) : '';
    if (debouncedRateMax === currentRate) {
      return;
    }
    const parsed = debouncedRateMax ? Number.parseInt(debouncedRateMax, 10) : null;
    if (debouncedRateMax && Number.isNaN(parsed)) {
      return;
    }
    updateFilters({ rateMax: parsed }, { scroll: false });
  }, [debouncedRateMax, filters.rateMax, isReady, updateFilters]);

  const filteredItems = useMemo(() => applySpecialistFilters(data, filters), [data, filters]);
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
    () => Array.from(new Set(data.map((item) => item.role))).sort((a, b) => a.localeCompare(b, 'ru-RU')),
    [data]
  );
  const skills = useMemo(
    () => Array.from(new Set(data.flatMap((item) => item.skills))).sort((a, b) => a.localeCompare(b, 'ru-RU')),
    [data]
  );
  const languages = useMemo(
    () => Array.from(new Set(data.flatMap((item) => item.languages))).sort((a, b) => a.localeCompare(b, 'ru-RU')),
    [data]
  );

  if (error) {
    return <ErrorState message="Не удалось загрузить каталог специалистов. Попробуйте обновить страницу." />;
  }

  const handleReset = () => {
    if (!isReady) {
      return;
    }
    applyFiltersState(cloneFilters(DEFAULT_SPECIALIST_FILTERS));
  };

  return (
    <section className="space-y-6" aria-live="polite" data-page-ready={isReady ? 'true' : 'false'}>
      <div className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-neutral-100">Поиск специалистов</h2>
            <p className="text-sm text-neutral-400">Фильтруйте каталог по ролям, навыкам, языку и ставке.</p>
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
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Формат</span>
            <select
              value={filters.workFormat ?? ''}
              onChange={(event) => updateFilters({ workFormat: (event.target.value as SpecialistFilters['workFormat']) || null })}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Любой формат</option>
              <option value="remote">Удалённо</option>
              <option value="office">В офисе</option>
              <option value="hybrid">Гибрид</option>
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-neutral-300 md:col-span-2">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Навыки</span>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const checked = filters.skills.includes(skill);
                return (
                  <label
                    key={skill}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-400 ${
                      checked
                        ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-100'
                        : 'border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-indigo-500/40 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                      checked={checked}
                      onChange={(event) => {
                        if (event.target.checked) {
                          updateFilters({ skills: [...filters.skills, skill] });
                        } else {
                          updateFilters({ skills: filters.skills.filter((item) => item !== skill) });
                        }
                      }}
                    />
                    {skill}
                  </label>
                );
              })}
            </div>
          </label>
          <div className="grid gap-2">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Ставка (₽/час)</span>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={rateMinDraft}
                onChange={(event) => setRateMinDraft(event.target.value)}
                placeholder="от"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={rateMaxDraft}
                onChange={(event) => setRateMaxDraft(event.target.value)}
                placeholder="до"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-neutral-300 md:col-span-2">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Поиск</span>
            <input
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder={SEARCH_PLACEHOLDER}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Сортировка</span>
            <select
              value={filters.sort}
              onChange={(event) => updateFilters({ sort: event.target.value as SpecialistFilters['sort'] }, { resetPage: false })}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="rating">По рейтингу</option>
              <option value="cost">По стоимости</option>
              <option value="new">Сначала обновлённые</option>
            </select>
          </label>
        </div>
      </div>

      <div ref={listRef} className="flex items-center justify-between text-sm text-neutral-400">
        <p>
          Найдено специалистов: <span className="font-semibold text-neutral-100">{total}</span>
        </p>
        {isPending && <p className="text-xs text-indigo-300">Обновляем результаты…</p>}
      </div>

      <div id="results">
        {pageItems.length === 0 ? (
          <EmptyState message="Ничего не найдено. Измените фильтры." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={(page) => updateFilters({ page }, { resetPage: false })} />
    </section>
  );
}
