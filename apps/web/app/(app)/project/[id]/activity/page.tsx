import { notFound } from 'next/navigation';
import { projectsRepository } from '@collabverse/api';
import ProjectActivityPageClient from './project-activity-page-client';

export default function ProjectActivityPage({ params }: { params: { id: string } }) {
  const project = projectsRepository.findById(params.id);
  if (!project) {
    notFound();
  }

  return <ProjectActivityPageClient projectId={project.id} projectTitle={project.title} />;
}
