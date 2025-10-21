import { projectsRepository } from '../repositories/projects-repository';
import { tasksRepository } from '../repositories/tasks-repository';
import { templatesRepository } from '../repositories/templates-repository';
import type { CatalogProject, ProjectTemplate } from '../types';

export type CatalogProjectItem = CatalogProject;
export type CatalogTemplateItem = ProjectTemplate;

function deduplicateLabels(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  const set = new Set<string>();
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      set.add(value.trim());
    }
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b, 'ru'));
}

export class ProjectCatalogService {
  getProjects(options: { archived?: boolean | null } = {}): CatalogProjectItem[] {
    const tasks = tasksRepository.list();
    const aggregation = new Map<string, { count: number; labels: Set<string> }>();
    for (const task of tasks) {
      const entry = aggregation.get(task.projectId);
      if (!entry) {
        aggregation.set(task.projectId, {
          count: 1,
          labels: new Set(deduplicateLabels(task.labels))
        });
      } else {
        entry.count += 1;
        for (const label of deduplicateLabels(task.labels)) {
          entry.labels.add(label);
        }
      }
    }

    return projectsRepository.list(options).map((project) => {
      const stats = aggregation.get(project.id);
      return {
        ...project,
        tasksCount: stats?.count ?? 0,
        labels: stats ? Array.from(stats.labels.values()).sort((a, b) => a.localeCompare(b, 'ru')) : []
      };
    });
  }

  getTemplates(): CatalogTemplateItem[] {
    return templatesRepository.list();
  }
}

export const projectCatalogService = new ProjectCatalogService();
