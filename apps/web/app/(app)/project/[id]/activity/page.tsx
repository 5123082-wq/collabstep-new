import { notFound } from 'next/navigation';
import { projectsRepository, DEFAULT_WORKSPACE_USER_ID } from '@collabverse/api';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';
import ProjectActivityPageClient from './project-activity-page-client';

export default function ProjectActivityPage({ params }: { params: { id: string } }) {
  const project = projectsRepository.findById(params.id);
  if (!project) {
    notFound();
  }

  // Check access for private projects
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;
  if (!projectsRepository.hasAccess(project.id, currentUserId)) {
    notFound();
  }

  return <ProjectActivityPageClient projectId={project.id} projectTitle={project.title} />;
}
