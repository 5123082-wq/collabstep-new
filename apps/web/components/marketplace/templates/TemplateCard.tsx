'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import clsx from 'clsx';
import type { MarketplaceTemplate } from '@/lib/marketplace/types';
import { useMarketplaceStore } from '@/lib/marketplace/store';

const CATEGORY_BADGES: Record<string, string> = {
  logo: 'Логотип',
  landing: 'Лендинг',
  ui_kit: 'UI-kit',
  presentation: 'Презентация'
};

const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
});

type TemplateCardProps = {
  template: MarketplaceTemplate;
};

export default function TemplateCard({ template }: TemplateCardProps) {
  const addToCart = useMarketplaceStore((state) => state.addToCart);
  const toggleFavorite = useMarketplaceStore((state) => state.toggleFavorite);
  const favorites = useMarketplaceStore((state) => state.favorites);
  const isFavorite = favorites.includes(template.id);

  const badgeLabel = useMemo(() => CATEGORY_BADGES[template.category] ?? 'Шаблон', [template.category]);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-800/70 bg-neutral-900/40 transition hover:-translate-y-1 hover:border-neutral-700 hover:shadow-2xl hover:shadow-black/30">
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
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="rounded-full bg-neutral-800/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-neutral-300">
            {badgeLabel}
          </span>
          <span className="text-neutral-500">{template.salesCount} продаж</span>
        </div>
        <div className="space-y-2">
          <Link
            href={`/market/templates/${template.id}`}
            className="line-clamp-2 text-base font-semibold text-neutral-100 transition hover:text-indigo-300"
          >
            {template.title}
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
            <span className="font-semibold text-neutral-100">{currencyFormatter.format(template.price)}</span>
            <span aria-hidden className="text-neutral-700">•</span>
            <span className="flex items-center gap-1">
              <span aria-hidden>★</span>
              {template.rating.toFixed(1)}
              <span className="text-neutral-600">({template.ratingCount})</span>
            </span>
            <span aria-hidden className="text-neutral-700">•</span>
            <span className="flex items-center gap-2 text-xs">
              <Image
                src={template.seller.avatarUrl}
                alt={template.seller.name}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="text-neutral-300">{template.seller.name}</span>
            </span>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => addToCart(template.id)}
            className="flex-1 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            В корзину
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(template.id)}
            aria-pressed={isFavorite}
            className={clsx(
              'rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300',
              isFavorite
                ? 'border-indigo-400 bg-indigo-500/10 text-indigo-200'
                : 'border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100'
            )}
          >
            {isFavorite ? 'Сохранено' : 'Сохранить'}
          </button>
        </div>
      </div>
    </article>
  );
}
