'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProjectDashboardPageClient from './project-dashboard-page-client';
import { flags } from '@/lib/flags';
import { readProjectState } from '@/lib/project/storage';

type ProjectPageProps = {
  params: { id: string };
};

export default function ProjectIndexPage({ params }: ProjectPageProps) {
  if (flags.PROJECTS_V1) {
    return <ProjectDashboardPageClient projectId={params.id} />;
  }

  return <LegacyProjectIndexPage params={params} />;
}

function LegacyProjectIndexPage({ params }: ProjectPageProps) {
  const router = useRouter();

  useEffect(() => {
    const state = readProjectState(params.id);
    const target = state.lastTab ? `/project/${params.id}/${state.lastTab}` : `/project/${params.id}/overview`;
    router.replace(target);
  }, [params.id, router]);

  return (
    <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-neutral-500">
      Перенаправляем в рабочий раздел…
    </div>
  );
}
