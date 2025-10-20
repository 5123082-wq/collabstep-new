import { notFound } from 'next/navigation';
import { flags } from '@/lib/flags';
import ProjectNewPageClient from './project-new-page-client';

export default function ProjectNewPage() {
  if (!flags.PROJECTS_V1) {
    notFound();
  }

  return <ProjectNewPageClient />;
}
