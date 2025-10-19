'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import clsx from 'clsx';
import type { MarketplaceTemplate } from '@/lib/marketplace/types';
import { useMarketplaceStore } from '@/lib/marketplace/store';
import { getTemplatePriceLabel, getTemplatePricingBadge } from '@/lib/marketplace/pricing';

const CATEGORY_BADGES: Record<string, string> = {
  logo: 'Логотип',
  landing: 'Лендинг',
  ui_kit: 'UI-kit',
  presentation: 'Презентация'
};

const salesFormatter = new Intl.NumberFormat('ru-RU');

type TemplateCardProps = {
  template: MarketplaceTemplate;
};

export default function TemplateCard({ template }: TemplateCardProps) {
  const addToCart = useMarketplaceStore((state) => state.addToCart);
  const toggleFavorite = useMarketplaceStore((state) => state.toggleFavorite);
  const favorites = useMarketplaceStore((state) => state.favorites);
  const isFavorite = favorites.includes(template.id);

  const badgeLabel = useMemo(() => CATEGORY_BADGES[template.category] ?? 'Шаблон', [template.category]);
  const priceInfo = useMemo(() => getTemplatePriceLabel(template), [template]);
  const pricingBadge = useMemo(() => getTemplatePricingBadge(template), [template]);
  const ratingStars = useMemo(() => Array.from({ length: 5 }, (_, index) => template.rating >= index + 1), [template.rating]);
  const formattedSales = useMemo(() => salesFormatter.format(template.salesCount), [template.salesCount]);

  const pricingBadgeClassName = useMemo(
    () =>
      clsx(
        'rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] ring-1 ring-inset',
        pricingBadge.tone === 'subscription' && 'bg-indigo-500/20 text-indigo-100 ring-indigo-500/40',
        pricingBadge.tone === 'free' && 'bg-emerald-500/15 text-emerald-100 ring-emerald-500/40',
        pricingBadge.tone === 'paid' && 'bg-neutral-800/80 text-neutral-200 ring-neutral-700/80'
      ),
    [pricingBadge.tone]
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-800/70 bg-neutral-950/60 transition hover:-translate-y-1 hover:border-neutral-700 hover:shadow-2xl hover:shadow-black/30">
      <div className="relative">
        <Link href={`/market/templates/${template.id}`} className="relative block aspect-[4/3] overflow-hidden">
          <Image
            src={template.previewUrl}
            alt={template.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 260px, (min-width: 1024px) 240px, (min-width: 768px) 280px, 100vw"
            loading="lazy"
          />
        </Link>
        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-neutral-900/85 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-neutral-200 ring-1 ring-neutral-700/80">
            {badgeLabel}
          </span>
          <span className={pricingBadgeClassName}>{pricingBadge.label}</span>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(template.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          className={clsx(
            'absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300',
            isFavorite
              ? 'border-indigo-400/80 bg-indigo-500/20 text-indigo-200'
              : 'border-neutral-700/80 bg-neutral-950/60 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100'
          )}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={clsx('h-5 w-5 transition', isFavorite ? 'scale-110' : 'group-hover:scale-105')}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21s-6-4.35-9-8.36C-1 7.52 2.24 3 6.5 3A4.62 4.62 0 0 1 12 6.1 4.62 4.62 0 0 1 17.5 3C21.76 3 25 7.52 21 12.64 18 16.65 12 21 12 21Z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-3">
          <Link
            href={`/market/templates/${template.id}`}
            className="line-clamp-2 text-lg font-semibold text-neutral-100 transition hover:text-indigo-300"
          >
            {template.title}
          </Link>
          <p className="line-clamp-2 text-sm text-neutral-400">{template.description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-400">
          <div className="flex items-center gap-1 text-amber-300">
            {ratingStars.map((isActive, index) => (
              <svg
                key={`star-${template.id}-${index}`}
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={clsx('h-4 w-4', isActive ? 'text-amber-300' : 'text-neutral-700')}
                fill={isActive ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={isActive ? 0 : 1.5}
              >
                <path d="m12 17.27-4.15 2.51 1.1-4.72L5 11.24l4.9-.42L12 6.5l2.1 4.32 4.9.42-3.95 3.82 1.1 4.72Z" />
              </svg>
            ))}
            <span className="ml-2 font-semibold text-neutral-100">{template.rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-500">({template.ratingCount})</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-neutral-500" fill="currentColor">
              <path d="M7 3h10a2 2 0 0 1 2 2v14l-7-3-7 3V5a2 2 0 0 1 2-2Z" />
            </svg>
            <span>{formattedSales} скачиваний</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-900/60 px-4 py-3">
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-neutral-100">{priceInfo.primary}</span>
              {priceInfo.secondary ? <span className="text-xs text-neutral-500">{priceInfo.secondary}</span> : null}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <Image
                src={template.seller.avatarUrl}
                alt={template.seller.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span>{template.seller.name}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => addToCart(template.id)}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              В корзину
            </button>
            <Link
              href={`/market/templates/${template.id}`}
              className="flex h-11 items-center justify-center rounded-xl border border-neutral-700 px-5 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:text-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
