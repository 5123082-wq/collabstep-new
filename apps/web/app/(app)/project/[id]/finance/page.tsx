import ProjectFinancePageClient from './project-finance-page-client';

type ProjectFinancePageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default function ProjectFinancePage({ params, searchParams }: ProjectFinancePageProps) {
  return <ProjectFinancePageClient projectId={params.id} searchParams={searchParams} />;
}
