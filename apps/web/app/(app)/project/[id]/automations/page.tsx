import dynamic from 'next/dynamic';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';
import { isFeatureEnabled } from '@/lib/feature-flags';

const automationsEnabled = isFeatureEnabled('financeAutomations');
const ProjectAutomationsPageContent = dynamic(() => import('./_wip/project-automations-page'), { ssr: false });

export default function ProjectAutomationsPage() {
  if (!automationsEnabled) {
    return <FeatureComingSoon title="Автоматизации проекта" />;
  }

  return <ProjectAutomationsPageContent />;
}
