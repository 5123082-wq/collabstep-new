import dynamic from 'next/dynamic';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';

const dashboardEnabled = process.env.NEXT_PUBLIC_FEATURE_PROJECT_DASHBOARD === '1';
const DashboardPageContent = dynamic(() => import('./_wip/dashboard-page'), { ssr: false });

export default function DashboardPage() {
  if (!dashboardEnabled) {
    return <FeatureComingSoon title="Дашборд проекта" />;
  }

  return <DashboardPageContent />;
}
