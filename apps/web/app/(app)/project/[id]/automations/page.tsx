import dynamic from 'next/dynamic';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';

const automationsEnabled = process.env.NEXT_PUBLIC_FEATURE_FINANCE_AUTOMATIONS === '1';
const ProjectAutomationsPageContent = dynamic(() => import('./_wip/project-automations-page'), { ssr: false });

export default function ProjectAutomationsPage() {
  if (!automationsEnabled) {
    return <FeatureComingSoon title="Автоматизации проекта" />;
  }

  return <ProjectAutomationsPageContent />;
}
