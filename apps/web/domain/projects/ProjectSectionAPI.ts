import type { ID, Project, ProjectStage } from './types';

export interface ProjectCatalogItem {
  id: ID;
  title: string;
  stage: ProjectStage | undefined | null;
  updatedAt: string;
  archived: boolean;
  tasksCount: number;
  labels: string[];
  description?: string;
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  ownerId?: ID;
  stage?: ProjectStage | null;
}

export interface UpdateProjectPayload {
  id: ID;
  title?: string;
  description?: string | null;
  stage?: ProjectStage | null;
  archived?: boolean;
}

export interface ProjectSectionAPI {
  fetchCatalogProjects(): Promise<ProjectCatalogItem[]>;
  fetchProject(id: ID): Promise<Project | null>;
  searchProjects(query: string): Promise<ProjectCatalogItem[]>;
  createProject(payload: CreateProjectPayload): Promise<Project>;
  updateProject(payload: UpdateProjectPayload): Promise<Project>;
}
