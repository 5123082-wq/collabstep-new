import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { loadProjects } from '@/lib/mock/loaders';
import type { ProjectT } from '@/lib/schemas/project';

import ProjectLayoutClient from './ProjectLayoutClient';

type ProjectLayoutProps = {
  children: ReactNode;
  params: { id: string };
};

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const projects: ProjectT[] = loadProjects();
  const project = projects.find((item) => item.id === params.id);

  if (!project) {
    notFound();
  }

  return <ProjectLayoutClient project={project}>{children}</ProjectLayoutClient>;
}
