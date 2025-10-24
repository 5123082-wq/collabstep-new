import { notFound, redirect } from 'next/navigation';
import { flags } from '@/lib/flags';
import { isFeatureEnabled } from '@/lib/feature-flags';
import ProjectNewPageClient from './project-new-page-client';

export default function ProjectNewPage() {
  if (!flags.PROJECTS_V1) {
    notFound();
  }

  if (isFeatureEnabled('projectCreateWizard')) {
    redirect('/app/projects/create');
  }

  return <ProjectNewPageClient />;
}
