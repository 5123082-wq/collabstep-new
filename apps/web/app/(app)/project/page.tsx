import { redirect } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/feature-flags';
import ProjectIndexPageScreen from '@/components/projects/ProjectIndexPageScreen';

type ProjectIndexPageProps = {
  searchParams?: { tab?: string };
};

export default function ProjectIndexPage({ searchParams: _searchParams }: ProjectIndexPageProps) {
  if (isFeatureEnabled('projectsOverview')) {
    redirect('/app/projects');
  }

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <ProjectIndexPageScreen />
    </main>
  );
}
