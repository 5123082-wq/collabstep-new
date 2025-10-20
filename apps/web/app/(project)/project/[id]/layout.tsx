import type { ReactNode } from 'react';
import { notFound, redirect } from 'next/navigation';
import ProjectLayoutClient from '@/components/project/ProjectLayoutClient';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session';
import { loadProjects } from '@/lib/mock/loaders';
import type { Project as LegacyProject } from '@/lib/schemas/project';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import type { Project as ProjectV1 } from '@/domain/projects/types';

type ProjectLayoutProps = {
  children: ReactNode;
  params: { id: string };
};

function findLegacyProject(projects: LegacyProject[], id: string): LegacyProject | null {
  return projects.find((item) => item.id === id) ?? null;
}

function mapProjectV1ToLegacy(project: ProjectV1): LegacyProject {
  return {
    id: project.id,
    name: project.title,
    code: project.id.slice(0, 8).toUpperCase(),
    status: project.stage ?? 'В работе',
    stage: project.stage ?? 'В работе',
    visibility: 'private',
    lead: project.ownerId
  };
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const session = getDemoSessionFromCookies();

  if (!session) {
    redirect('/login?toast=auth-required');
  }

  if (flags.PROJECTS_V1) {
    const project = memory.PROJECTS.find((candidate) => candidate.id === params.id);

    if (!project) {
      notFound();
    }

    const mapped = mapProjectV1ToLegacy(project);

    return (
      <ProjectLayoutClient project={mapped} session={session}>
        {children}
      </ProjectLayoutClient>
    );
  }

  const legacyProjects = loadProjects();
  const legacy = findLegacyProject(legacyProjects, params.id);

  if (!legacy) {
    notFound();
  }

  return (
    <ProjectLayoutClient project={legacy} session={session}>
      {children}
    </ProjectLayoutClient>
  );
}
