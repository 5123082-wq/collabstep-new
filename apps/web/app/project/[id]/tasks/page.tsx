import { notFound } from 'next/navigation';
import { flags } from '@/lib/flags';
import { PROJECTS } from '@/app/api/projects/storage';
import ProjectTasksPageClient from './project-tasks-page-client';

type ProjectTasksPageProps = {
  params: {
    id: string;
  };
};

export default function ProjectTasksPage({ params }: ProjectTasksPageProps) {
  if (!flags.PROJECTS_V1) {
    notFound();
  }

  const project = PROJECTS.find((item) => item.id === params.id);
  if (!project) {
    notFound();
  }

  return <ProjectTasksPageClient projectId={project.id} projectTitle={project.title} />;
}
