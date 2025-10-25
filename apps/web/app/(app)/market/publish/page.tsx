import MarketBreadcrumbs from '@/components/marketplace/MarketBreadcrumbs';

export default function MarketPublishPage() {
  return (
    <div className="space-y-6">
      <MarketBreadcrumbs items={[{ label: 'Маркетплейс', href: '/market' }, { label: 'Опубликовать' }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-50">Публикация в маркетплейсе</h1>
        <p className="text-neutral-400">
          Мастер публикации готовится к релизу. Здесь появятся шаги для загрузки шаблонов, проектов и пакетов
          услуг.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-900/40 p-10 text-sm text-neutral-400">
        Функция «Опубликовать» находится в разработке.
      </div>
    </div>
  );
}
