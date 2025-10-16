import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  status: z.string(),
  stage: z.string(),
  visibility: z.enum(['private', 'public']),
  lead: z.string().optional()
});

export const ProjectsSchema = z.array(ProjectSchema);

export type Project = z.infer<typeof ProjectSchema>;
