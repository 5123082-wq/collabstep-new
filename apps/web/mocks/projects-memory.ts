import type { Iteration, Project, ProjectWorkflow, Task } from '@/domain/projects/types';

export const memory = {
  PROJECTS: [] as Project[],
  TASKS: [] as Task[],
  WORKFLOWS: {} as Record<string, ProjectWorkflow>,
  ITERATIONS: [] as Iteration[],
  TEMPLATES: [
    { id: 'tpl-brand', title: 'Бренд-пакет', kind: 'brand', summary: 'Нейминг, айдентика, гайд' },
    { id: 'tpl-landing', title: 'Лендинг', kind: 'landing', summary: 'Одностраничник с формой' },
    { id: 'tpl-mkt', title: 'Маркетинг', kind: 'marketing', summary: 'Кампания + контент-план' },
    { id: 'tpl-product', title: 'Digital-продукт', kind: 'product', summary: 'MVP флоу + бэклог' }
  ]
};
