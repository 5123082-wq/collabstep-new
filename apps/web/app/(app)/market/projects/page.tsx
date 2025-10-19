import MarketBreadcrumbs from '@/components/marketplace/MarketBreadcrumbs';

export default function MarketProjectsPage() {
  return (
    <div className="space-y-6">
      <MarketBreadcrumbs items={[{ label: 'Маркетплейс', href: '/market' }, { label: 'Готовые проекты' }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-50">Готовые проекты</h1>
        <p className="max-w-3xl text-neutral-400">
          Витрина готовых цифровых проектов, которые можно приобрести и развернуть у себя. Просмотр и покупка
          будут доступны после обновления раздела.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-900/40 p-10 text-sm text-neutral-400">
        Каталог проектов находится в разработке.
      </div>
    </div>
  );
}
