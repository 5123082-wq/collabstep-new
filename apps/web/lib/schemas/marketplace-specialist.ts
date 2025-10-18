import { z } from 'zod';

const SpecialistRateSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
    currency: z.string(),
    period: z.enum(['hour', 'day', 'project'])
  })
  .refine((value) => value.max >= value.min, {
    message: 'Максимальная ставка должна быть не меньше минимальной'
  });

export const SpecialistSchema = z.object({
  id: z.string(),
  handle: z.string(),
  name: z.string(),
  role: z.string(),
  description: z.string(),
  skills: z.array(z.string()).min(1),
  rate: SpecialistRateSchema,
  rating: z.number().min(0).max(5),
  reviews: z.number().int().nonnegative(),
  languages: z.array(z.string()).min(1),
  workFormats: z.array(z.enum(['remote', 'office', 'hybrid'])).min(1),
  experienceYears: z.number().int().nonnegative(),
  timezone: z.string(),
  availability: z.array(z.string()).min(1),
  engagement: z.array(z.string()).min(1),
  updatedAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Некорректная дата обновления')
});

export const SpecialistsSchema = z.array(SpecialistSchema);

export type Specialist = z.infer<typeof SpecialistSchema>;
export type SpecialistRate = z.infer<typeof SpecialistRateSchema>;
