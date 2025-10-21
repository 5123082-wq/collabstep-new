export * from './types';
export { memory } from './data/memory';
export { ProjectsRepository, projectsRepository } from './repositories/projects-repository';
export { TemplatesRepository, templatesRepository } from './repositories/templates-repository';
export { TasksRepository, tasksRepository } from './repositories/tasks-repository';
export {
  ProjectCatalogService,
  projectCatalogService,
  type CatalogProjectItem,
  type CatalogTemplateItem
} from './services/project-catalog-service';
