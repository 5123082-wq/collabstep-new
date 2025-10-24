import dynamic from 'next/dynamic';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';
import { isFeatureEnabled } from '@/lib/feature-flags';

const createWizardEnabled = isFeatureEnabled('projectCreateWizard');
const ProjectCreatePageContent = dynamic(() => import('../_wip/create-page'), { ssr: false });

export default function ProjectCreatePlaceholderPage() {
  if (!createWizardEnabled) {
    return <FeatureComingSoon title="Мастер создания проектов" />;
  }

  return <ProjectCreatePageContent />;
}
