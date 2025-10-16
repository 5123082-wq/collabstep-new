import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  projectId: z.string(),
  assignee: z.string(),
  status: z.string()
});

export const TasksSchema = z.array(TaskSchema);

export type Task = z.infer<typeof TaskSchema>;
