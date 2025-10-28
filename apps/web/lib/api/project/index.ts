import { randomUUID } from 'crypto';
import { DEFAULT_WORKSPACE_ID } from '@collabverse/api';
import { memory } from '@/mocks/projects-memory';
import type {
  CreateProjectPayload,
  ProjectCatalogItem,
  ProjectSectionAPI,
  UpdateProjectPayload
} from '@/domain/projects/ProjectSectionAPI';
import type { Project } from '@/domain/projects/types';

function delay(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function cloneProject(project: Project): Project {
  return { ...project };
}

function mapProjectToCatalogItem(project: Project): ProjectCatalogItem {
  const tasks = (memory.TASKS ?? []).filter((task) => task.projectId === project.id);
  const labels = Array.from(
    new Set(
      tasks.flatMap((task) =>
        Array.isArray(task.labels) ? task.labels.filter((label): label is string => typeof label === 'string') : []
      )
    )
  );

  const catalogItem: ProjectCatalogItem = {
    id: project.id,
    title: project.title,
    stage: project.stage ?? null,
    updatedAt: project.updatedAt,
    archived: project.archived,
    tasksCount: tasks.length,
    labels
  };

  if (project.description !== undefined) {
    catalogItem.description = project.description;
  }

  return catalogItem;
}

async function ensureDelay() {
  await delay(120);
}

function resolveOwnerId(ownerId?: string): string {
  if (ownerId) {
    return ownerId;
  }
  const fallback = (memory.WORKSPACE_USERS ?? [])[0]?.id;
  return fallback ?? 'workspace-owner';
}

export const projectSectionApi: ProjectSectionAPI = {
  async fetchCatalogProjects() {
    await ensureDelay();
    return (memory.PROJECTS ?? []).map((project) => mapProjectToCatalogItem(project));
  },
  async fetchProject(id) {
    await ensureDelay();
    const project = (memory.PROJECTS ?? []).find((item) => item.id === id);
    return project ? cloneProject(project) : null;
  },
  async searchProjects(query) {
    await ensureDelay();
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return this.fetchCatalogProjects();
    }
    return (memory.PROJECTS ?? [])
      .filter((project) => project.title.toLowerCase().includes(normalized))
      .map((project) => mapProjectToCatalogItem(project));
  },
  async createProject(payload: CreateProjectPayload) {
    await ensureDelay();
    const now = new Date().toISOString();
    const baseId = payload.title?.trim().toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') ?? '';
    const generatedId = baseId ? `${baseId}-${randomUUID().slice(0, 6)}` : randomUUID();
    const project: Project = {
      id: generatedId,
      workspaceId: payload.workspaceId ?? DEFAULT_WORKSPACE_ID,
      title: payload.title,
      ownerId: resolveOwnerId(payload.ownerId),
      visibility: payload.visibility ?? 'private',
      workflowId: `wf-${generatedId}`,
      type: payload.type ?? 'internal',
      archived: false,
      createdAt: now,
      updatedAt: now
    };

    if (payload.description !== undefined) {
      project.description = payload.description;
    }

    if (payload.stage !== undefined && payload.stage !== null) {
      project.stage = payload.stage;
    }

    memory.PROJECTS = [...(memory.PROJECTS ?? []), project];
    return cloneProject(project);
  },
  async updateProject(payload: UpdateProjectPayload) {
    await ensureDelay();
    const projects = memory.PROJECTS ?? [];
    const index = projects.findIndex((item) => item.id === payload.id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    const current = projects[index]!;
    const updated: Project = {
      ...current,
      archived: payload.archived ?? current.archived,
      updatedAt: new Date().toISOString()
    };

    if (payload.title !== undefined) {
      updated.title = payload.title;
    }

    if (payload.description !== undefined) {
      if (payload.description === null) {
        delete updated.description;
      } else {
        updated.description = payload.description;
      }
    }

    if (payload.stage !== undefined) {
      if (payload.stage === null) {
        delete updated.stage;
      } else {
        updated.stage = payload.stage;
      }
    }

    projects[index] = updated;
    memory.PROJECTS = [...projects];
    return cloneProject(updated);
  }
};

export function projectToCatalogItem(project: Project): ProjectCatalogItem {
  return mapProjectToCatalogItem(project);
}

export type { ProjectCatalogItem };
