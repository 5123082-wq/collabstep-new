import { randomUUID } from 'crypto';
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

  return {
    id: project.id,
    title: project.title,
    stage: project.stage ?? null,
    updatedAt: project.updatedAt,
    archived: project.archived,
    tasksCount: tasks.length,
    labels,
    description: project.description
  };
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
    const project: Project = {
      id: baseId ? `${baseId}-${randomUUID().slice(0, 6)}` : randomUUID(),
      title: payload.title,
      description: payload.description,
      ownerId: resolveOwnerId(payload.ownerId),
      stage: payload.stage ?? null,
      archived: false,
      createdAt: now,
      updatedAt: now
    };
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
    const current = projects[index];
    const updated: Project = {
      ...current,
      title: payload.title ?? current.title,
      description: payload.description ?? current.description,
      stage: payload.stage ?? current.stage ?? null,
      archived: payload.archived ?? current.archived,
      updatedAt: new Date().toISOString()
    };
    projects[index] = updated;
    memory.PROJECTS = [...projects];
    return cloneProject(updated);
  }
};

export function projectToCatalogItem(project: Project): ProjectCatalogItem {
  return mapProjectToCatalogItem(project);
}

export type { ProjectCatalogItem };
