import MarketBreadcrumbs from '@/components/marketplace/MarketBreadcrumbs';

export default function MarketSellerPage() {
  return (
    <div className="space-y-6">
      <MarketBreadcrumbs items={[{ label: 'Маркетплейс', href: '/market' }, { label: 'Мои продажи' }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-50">Кабинет продавца</h1>
        <p className="max-w-3xl text-neutral-400">
          Управляйте листингами, черновиками и выплатами. Аналитика по продажам появится в будущих обновлениях.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-900/40 p-10 text-sm text-neutral-400">
        Кабинет продавца в разработке.
      </div>
    </div>
  );
}
