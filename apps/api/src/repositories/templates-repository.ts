import { memory } from '../data/memory';
import type { ProjectTemplate } from '../types';

function cloneTemplate(template: ProjectTemplate): ProjectTemplate {
  return { ...template };
}

export class TemplatesRepository {
  list(): ProjectTemplate[] {
    return memory.TEMPLATES.map(cloneTemplate);
  }

  findById(id: string): ProjectTemplate | null {
    const template = memory.TEMPLATES.find((item) => item.id === id);
    return template ? cloneTemplate(template) : null;
  }
}

export const templatesRepository = new TemplatesRepository();
