import { z } from 'zod';

export const Invoice = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number(),
  projectId: z.string(),
  currency: z.string()
});

export type InvoiceT = z.infer<typeof Invoice>;
