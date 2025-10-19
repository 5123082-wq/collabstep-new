import { notFound } from 'next/navigation';
import VacancyDetail from '@/components/marketplace/VacancyDetail';
import { loadVacancies } from '@/lib/mock/loaders';

type VacancyDetailPageProps = {
  params: { id: string };
};

export default function PerformersVacancyDetailPage({ params }: VacancyDetailPageProps) {
  const { items } = loadVacancies();
  const vacancy = items.find((item) => item.id === params.id || item.slug === params.id);

  if (!vacancy) {
    notFound();
  }

  return <VacancyDetail vacancy={vacancy} />;
}

export function generateStaticParams() {
  const { items } = loadVacancies();
  return items.map((vacancy) => ({ id: vacancy.id }));
}
