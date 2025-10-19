import { redirect } from 'next/navigation';

type MarketplaceVacancyRedirectProps = {
  params: { id: string };
};

export default function MarketplaceVacancyRedirectPage({ params }: MarketplaceVacancyRedirectProps) {
  redirect(`/app/performers/vacancies/${params.id}`);
}
