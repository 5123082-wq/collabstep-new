import { notFound } from 'next/navigation';
import { PROJECTS } from '@/app/api/projects/storage';
import ProjectTasksPageClient from './project-tasks-page-client';

type ProjectTasksPageV1Props = {
  params: {
    id: string;
  };
};

export function ProjectTasksPageV1({ params }: ProjectTasksPageV1Props) {
  const project = PROJECTS.find((candidate) => candidate.id === params.id);

  if (!project) {
    notFound();
  }

  return <ProjectTasksPageClient projectId={project.id} projectTitle={project.title} />;
}

export default ProjectTasksPageV1;
