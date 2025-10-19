import type { Metadata } from 'next';
import VacanciesCatalog from '@/components/marketplace/VacanciesCatalog';
import { loadVacancies } from '@/lib/mock/loaders';
import { getSiteUrl } from '@/lib/seo/siteUrl';

export const metadata: Metadata = {
  title: 'Вакансии маркетплейса — Collabverse',
  description: 'Актуальные запросы команд Collabverse: проекты, условия и форматы сотрудничества для специалистов.',
  alternates: {
    canonical: `${getSiteUrl()}/app/marketplace/vacancies`
  }
};

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
