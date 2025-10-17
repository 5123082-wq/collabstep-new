import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import ProjectLayoutClient from '@/components/project/ProjectLayoutClient';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session';
import { loadProjects } from '@/lib/mock/loaders';
import type { Project } from '@/lib/schemas/project';
import { redirect } from 'next/navigation';

type ProjectLayoutProps = {
  children: ReactNode;
  params: { id: string };
};

function findProject(projects: Project[], id: string): Project | null {
  return projects.find((item) => item.id === id) ?? null;
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const session = getDemoSessionFromCookies();

  if (!session) {
    redirect('/login?toast=auth-required');
  }

  const projects = loadProjects();
  const project = findProject(projects, params.id);

  if (!project) {
    notFound();
  }

  return (
    <ProjectLayoutClient project={project} session={session}>
      {children}
    </ProjectLayoutClient>
  );
}
