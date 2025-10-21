import { notFound } from 'next/navigation';
import { flags } from '@/lib/flags';
import ProjectsIndexPageClient from './projects-index-page-client';

export default function ProjectsIndexPage({
  searchParams
}: {
  searchParams?: { tab?: string | string[] };
}) {
  if (!flags.PROJECTS_V1) {
    notFound();
  }

  const tabParam = searchParams?.tab;
  const initialTab = Array.isArray(tabParam) ? tabParam[0] : tabParam;

  return <ProjectsIndexPageClient initialTab={initialTab ?? ''} />;
}
