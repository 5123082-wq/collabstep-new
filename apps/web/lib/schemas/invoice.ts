import { z } from 'zod';

export const InvoiceSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number(),
  projectId: z.string(),
  currency: z.string()
});

export const InvoicesSchema = z.array(InvoiceSchema);

export type Invoice = z.infer<typeof InvoiceSchema>;
