import { z } from 'zod';

export const Task = z.object({
  id: z.string(),
  title: z.string(),
  projectId: z.string(),
  assignee: z.string(),
  status: z.string()
});

export type TaskT = z.infer<typeof Task>;
