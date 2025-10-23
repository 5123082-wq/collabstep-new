import dynamic from 'next/dynamic';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';

type ProjectFinancePageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

const budgetLimitsEnabled = process.env.NEXT_PUBLIC_FEATURE_BUDGET_LIMITS === '1';
const ProjectFinancePageContent = dynamic(() => import('./_wip/project-finance-page-client'), { ssr: false });

export default function ProjectFinancePage({ params, searchParams }: ProjectFinancePageProps) {
  if (!budgetLimitsEnabled) {
    return <FeatureComingSoon title="Финансовый модуль проекта" />;
  }

  return <ProjectFinancePageContent projectId={params.id} searchParams={searchParams} />;
}
