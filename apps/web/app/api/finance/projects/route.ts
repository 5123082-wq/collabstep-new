import { projectsRepository } from '@collabverse/api';
import { jsonError, jsonOk } from '@/lib/api/http';
import { getAuthFromRequest, getProjectRole } from '@/lib/api/finance-access';

export async function GET(request: Request) {
  const auth = getAuthFromRequest(request);
  if (!auth) {
    return jsonError('UNAUTHORIZED', { status: 401 });
  }

  const projects = projectsRepository.list();
  const items = projects
    .filter((project) => {
      // Filter out private projects the user doesn't have access to
      return projectsRepository.hasAccess(project.id, auth.userId);
    })
    .map((project) => {
      const role = getProjectRole(project.id, auth.userId);
      return {
        id: project.id,
        name: project.title,
        role
      };
    });

  return jsonOk({ items });
}
