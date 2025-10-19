'use client';

import { useMemo } from 'react';
import { useMarketplaceStore } from '@/lib/marketplace/store';
import type { MarketplaceTemplate } from '@/lib/marketplace/types';

const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
});

type TemplatePurchaseActionsProps = {
  template: MarketplaceTemplate;
};

export default function TemplatePurchaseActions({ template }: TemplatePurchaseActionsProps) {
  const addToCart = useMarketplaceStore((state) => state.addToCart);
  const toggleFavorite = useMarketplaceStore((state) => state.toggleFavorite);
  const favorites = useMarketplaceStore((state) => state.favorites);
  const isFavorite = favorites.includes(template.id);

  const priceLabel = useMemo(() => currencyFormatter.format(template.price), [template.price]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Стоимость</p>
        <p className="text-3xl font-semibold text-neutral-50">{priceLabel}</p>
        <p className="mt-2 text-sm text-neutral-400">Лицензия: {template.license}</p>
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => addToCart(template.id)}
          className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        >
          В корзину
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(template.id)}
          className="w-full rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:text-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        >
          {isFavorite ? 'Сохранено в избранном' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}
