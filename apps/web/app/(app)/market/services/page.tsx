import MarketBreadcrumbs from '@/components/marketplace/MarketBreadcrumbs';

export default function MarketServicesPage() {
  return (
    <div className="space-y-6">
      <MarketBreadcrumbs items={[{ label: 'Маркетплейс', href: '/market' }, { label: 'Пакеты услуг' }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-50">Пакеты услуг</h1>
        <p className="max-w-3xl text-neutral-400">
          Здесь будут пакетные предложения студий и команд с фиксированными сроками и стоимостью. Раздел получит
          листинг и лид-форму на следующих итерациях.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-900/40 p-10 text-sm text-neutral-400">
        Листинг услуг в разработке.
      </div>
    </div>
  );
}
