import VacanciesCatalog from '@/components/marketplace/VacanciesCatalog';
import { loadVacancies } from '@/lib/mock/loaders';

export default function MarketplaceVacanciesPage() {
  const { items, error } = loadVacancies();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-50">Вакансии</h1>
        <p className="text-sm text-neutral-400">Здесь собраны активные запросы команд на специалистов и консультантов.</p>
      </header>
      <VacanciesCatalog data={items} error={error} />
    </div>
  );
}
