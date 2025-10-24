import dynamic from 'next/dynamic';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';
import { isFeatureEnabled } from '@/lib/feature-flags';

const workspaceEnabled = isFeatureEnabled('tasksWorkspace');
const ProjectsWorkspacePageContent = dynamic(() => import('../_wip/workspace-page'), { ssr: false });

export default function ProjectsWorkspacePlaceholder() {
  if (!workspaceEnabled) {
    return <FeatureComingSoon title="Рабочее пространство проектов" />;
  }

  return <ProjectsWorkspacePageContent />;
}
