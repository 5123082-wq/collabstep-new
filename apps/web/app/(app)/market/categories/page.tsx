import MarketBreadcrumbs from '@/components/marketplace/MarketBreadcrumbs';

export default function MarketCategoriesPage() {
  return (
    <div className="space-y-6">
      <MarketBreadcrumbs items={[{ label: 'Маркетплейс', href: '/market' }, { label: 'Категории и подборки' }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-50">Категории и подборки</h1>
        <p className="text-neutral-400">
          Витрина категорий и тематических подборок появится в следующих релизах. Здесь будут тайлы навигации и
          предфильтрованные ленты шаблонов и проектов.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-900/40 p-10 text-sm text-neutral-400">
        Раздел категорий в разработке.
      </div>
    </div>
  );
}
