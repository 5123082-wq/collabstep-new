import dynamic from 'next/dynamic';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';
import { isFeatureEnabled } from '@/lib/feature-flags';

const createWizardEnabled = isFeatureEnabled('projectCreateWizard');
const ProjectCreateWizardPage = dynamic(() => import('./project-create-wizard-page-client'), {
  ssr: false
});

// [PLAN:S3-entry] P3 wizard entrypoint guarded by feature flag.
export default function ProjectCreatePage() {
  if (!createWizardEnabled) {
    return <FeatureComingSoon title="Мастер создания проектов" />;
  }

  return <ProjectCreateWizardPage />;
}
