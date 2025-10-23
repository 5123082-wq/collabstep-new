'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { MARKETING_HUB_PATH, PROJECTS_HUB_PATH } from '@/components/app/LeftMenu.config';

const marketingTabs = [
  {
    id: 'overview',
    label: 'Обзор',
    href: `${MARKETING_HUB_PATH}/overview`,
    description: 'Дашборд прогресса и метрик маркетинга'
  },
  {
    id: 'campaigns',
    label: 'Кампании & Реклама',
    href: `${MARKETING_HUB_PATH}/campaigns`,
    description: 'Управление кампаниями и подключёнными рекламными аккаунтами'
  },
  {
    id: 'research',
    label: 'Исследования',
    href: `${MARKETING_HUB_PATH}/research`,
    description: 'Инсайты по ЦА, соцсетям и конкурентам'
  },
  {
    id: 'content-seo',
    label: 'Контент & SEO',
    href: `${MARKETING_HUB_PATH}/content-seo`,
    description: 'Календарь публикаций и управление семантикой'
  },
  {
    id: 'analytics',
    label: 'Аналитика & Интеграции',
    href: `${MARKETING_HUB_PATH}/analytics`,
    description: 'Источники данных и атрибуция эффективности'
  }
] as const;

export default function MarketingLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-neutral-900 bg-neutral-950/70 p-6 shadow-[0_0_30px_rgba(0,0,0,0.25)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Маркетинговый хаб</p>
            <h1 className="text-3xl font-semibold text-white">Маркетинг проекта</h1>
            <p className="max-w-2xl text-sm text-neutral-400">
              Управляйте кампаниями, исследованиями и аналитикой, оставаясь в связке с проектами и финансами.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={PROJECTS_HUB_PATH}
              className="rounded-2xl border border-indigo-500/50 bg-indigo-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Связанные проекты
            </Link>
            <Link
              href="/app/finance/expenses"
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-200 transition hover:border-indigo-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Бюджеты и факт
            </Link>
          </div>
        </div>
        <nav aria-label="Подразделы маркетинга" className="mt-6 overflow-x-auto">
          <ul className="flex min-w-full gap-3">
            {marketingTabs.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <li key={tab.id}>
                  <Link
                    href={tab.href}
                    className={clsx(
                      'flex min-w-[220px] flex-col gap-1 rounded-2xl border px-4 py-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                      active
                        ? 'border-indigo-500/60 bg-indigo-500/15 text-white'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-indigo-500/40 hover:text-white'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="text-sm font-semibold">{tab.label}</span>
                    <span className="text-xs text-neutral-500">{tab.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </section>
      <div className="space-y-8">{children}</div>
    </div>
  );
}

export const marketingNavigation = marketingTabs.map(({ id, label, href }) => ({ id, label, href }));
