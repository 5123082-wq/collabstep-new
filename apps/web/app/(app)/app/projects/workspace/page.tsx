import dynamic from 'next/dynamic';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';

const workspaceEnabled = process.env.NEXT_PUBLIC_FEATURE_TASKS_WORKSPACE === '1';
const ProjectsWorkspacePageContent = dynamic(() => import('../_wip/workspace-page'), { ssr: false });

export default function ProjectsWorkspacePlaceholder() {
  if (!workspaceEnabled) {
    return <FeatureComingSoon title="Рабочее пространство проектов" />;
  }

  return <ProjectsWorkspacePageContent />;
}
