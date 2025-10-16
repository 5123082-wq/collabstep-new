import { z } from 'zod';

export const Project = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  status: z.string(),
  stage: z.string(),
  visibility: z.enum(['private', 'public']),
  lead: z.string()
});

export type ProjectT = z.infer<typeof Project>;
