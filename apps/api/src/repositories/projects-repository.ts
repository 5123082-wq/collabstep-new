import { memory } from '../data/memory';
import type { Project, ProjectMember, ProjectStage, ProjectType, ProjectVisibility } from '../types';

function cloneProject(project: Project): Project {
  return { ...project };
}

export class ProjectsRepository {
  list(options: { archived?: boolean | null } = {}): Project[] {
    const { archived = null } = options;
    const items =
      archived === null
        ? memory.PROJECTS
        : memory.PROJECTS.filter((project) => project.archived === archived);
    return items.map(cloneProject);
  }

  findById(id: string): Project | null {
    const project = memory.PROJECTS.find((item) => item.id === id);
    return project ? cloneProject(project) : null;
  }

  getMember(projectId: string, userId: string): ProjectMember | null {
    const members = memory.PROJECT_MEMBERS[projectId] ?? [];
    return members.find((member) => member.userId === userId) ?? null;
  }

  listMembers(projectId: string): ProjectMember[] {
    return (memory.PROJECT_MEMBERS[projectId] ?? []).map((member) => ({ ...member }));
  }

  create(payload: {
    title: string;
    description?: string;
    ownerId: string;
    workspaceId: string;
    stage?: ProjectStage;
    deadline?: string;
    type?: ProjectType;
    visibility?: ProjectVisibility;
    workflowId?: string;
  }): Project {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const workflowId = payload.workflowId ?? `wf-${id}`;
    const allowedTypes: ProjectType[] = ['product', 'marketing', 'operations', 'service', 'internal'];
    const type = payload.type && allowedTypes.includes(payload.type) ? payload.type : undefined;

    const visibility: ProjectVisibility = payload.visibility === 'public' ? 'public' : 'private';

    const project: Project = {
      id,
      workspaceId: payload.workspaceId,
      title: payload.title,
      description: payload.description ?? '',
      ownerId: payload.ownerId,
      visibility,
      workflowId,
      archived: false,
      createdAt: now,
      updatedAt: now,
      ...(payload.stage ? { stage: payload.stage } : {}),
      ...(payload.deadline ? { deadline: payload.deadline } : {})
    };

    if (type) {
      project.type = type;
    }
    memory.PROJECTS.push(project);
    return cloneProject(project);
  }

  update(
    id: string,
    patch: Partial<
      Pick<Project, 'title' | 'description' | 'stage' | 'archived' | 'deadline' | 'type' | 'visibility' | 'workflowId'>
    >
  ): Project | null {
    const idx = memory.PROJECTS.findIndex((item) => item.id === id);
    if (idx === -1) {
      return null;
    }
    const current = memory.PROJECTS[idx];
    if (!current) {
      return null;
    }

    const next: Project = {
      ...current,
      updatedAt: new Date().toISOString()
    };

    if (typeof patch.title === 'string' && patch.title.trim()) {
      next.title = patch.title.trim();
    }

    if (typeof patch.description === 'string') {
      next.description = patch.description;
    }

    if (typeof patch.stage === 'string' && patch.stage) {
      next.stage = patch.stage as ProjectStage;
    }

    if (
      typeof patch.type === 'string' &&
      ['product', 'marketing', 'operations', 'service', 'internal'].includes(patch.type)
    ) {
      next.type = patch.type as ProjectType;
    }

    if (typeof patch.archived === 'boolean') {
      next.archived = patch.archived;
    }

    if (patch.visibility === 'private' || patch.visibility === 'public') {
      next.visibility = patch.visibility;
    }

    if (typeof patch.workflowId === 'string' && patch.workflowId) {
      next.workflowId = patch.workflowId;
    }

    if ('deadline' in patch) {
      if (typeof patch.deadline === 'string' && patch.deadline) {
        next.deadline = patch.deadline;
      } else {
        delete next.deadline;
      }
    }

    memory.PROJECTS[idx] = next;
    return cloneProject(next);
  }

  delete(id: string): boolean {
    const idx = memory.PROJECTS.findIndex((item) => item.id === id);
    if (idx === -1) {
      return false;
    }
    memory.PROJECTS.splice(idx, 1);
    memory.TASKS = memory.TASKS.filter((task) => task.projectId !== id);
    memory.ITERATIONS = memory.ITERATIONS.filter((iteration) => iteration.projectId !== id);
    delete memory.WORKFLOWS[id];
    delete memory.PROJECT_MEMBERS[id];
    return true;
  }

  archive(id: string): Project | null {
    return this.update(id, { archived: true });
  }

  unarchive(id: string): Project | null {
    return this.update(id, { archived: false });
  }
}

export const projectsRepository = new ProjectsRepository();
