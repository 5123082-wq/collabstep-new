import { notFound } from 'next/navigation';
import { memory } from '@/mocks/projects-memory';
import ProjectTasksPageClient from './project-tasks-page-client';

type ProjectTasksPageV1Props = {
  params: {
    id: string;
  };
  searchParams?: {
    view?: string;
  };
};

export function ProjectTasksPageV1({ params, searchParams }: ProjectTasksPageV1Props) {
  const project = memory.PROJECTS.find((candidate) => candidate.id === params.id);

  if (!project) {
    notFound();
  }

  const initialView = searchParams?.view;

  return (
    <ProjectTasksPageClient
      projectId={project.id}
      projectTitle={project.title}
      viewsEnabled
      {...(initialView ? { initialView } : {})}
    />
  );
}

export default ProjectTasksPageV1;
