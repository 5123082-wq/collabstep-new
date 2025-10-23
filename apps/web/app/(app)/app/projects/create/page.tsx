import dynamic from 'next/dynamic';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';

const createWizardEnabled = process.env.NEXT_PUBLIC_FEATURE_CREATE_WIZARD === '1';
const ProjectCreatePageContent = dynamic(() => import('../_wip/create-page'), { ssr: false });

export default function ProjectCreatePlaceholderPage() {
  if (!createWizardEnabled) {
    return <FeatureComingSoon title="Мастер создания проектов" />;
  }

  return <ProjectCreatePageContent />;
}
