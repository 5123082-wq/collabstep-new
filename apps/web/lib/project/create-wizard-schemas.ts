import { z } from 'zod';
import type { ProjectStage } from '@/domain/projects/types';

export const projectStageOptions = [
  'discovery',
  'design',
  'build',
  'launch',
  'support'
] as const satisfies ProjectStage[];

const budgetStringSchema = z
  .string()
  .trim()
  .nullable()
  .refine((value) => {
    if (value === null || value === '') {
      return true;
    }
    return /^\d+(?:[.,]\d{0,2})?$/.test(value);
  }, 'Укажите бюджет в формате 100000 или 100000,50');

const currencySchema = z
  .string()
  .trim()
  .nullable()
  .refine((value) => {
    if (value === null || value === '') {
      return true;
    }
    return /^[A-Z]{3}$/.test(value.toUpperCase());
  }, 'Используйте трёхбуквенный код валюты');

export const WizardSelectionSchema = z
  .object({
    mode: z.enum(['blank', 'template']),
    templateId: z.string().min(1).nullable()
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'template' && !value.templateId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['templateId'],
        message: 'Выберите шаблон для продолжения'
      });
    }
  });

export const WizardDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(200, 'Название не должно превышать 200 символов'),
  description: z
    .string()
    .trim()
    .max(2000, 'Описание не должно превышать 2000 символов')
    .nullable(),
  visibility: z.enum(['private', 'public']),
  stage: z.enum(projectStageOptions),
  deadline: z
    .string()
    .trim()
    .nullable()
    .refine((value) => {
      if (!value) {
        return true;
      }
      const timestamp = Date.parse(value);
      return Number.isFinite(timestamp);
    }, 'Укажите корректную дату дедлайна'),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Метка не может быть пустой')
        .max(24, 'Метка не должна превышать 24 символа')
    )
    .max(8, 'Максимум 8 меток'),
  finance: z.object({
    budget: budgetStringSchema,
    currency: currencySchema,
    paymentType: z.enum(['fixed', 'time-and-materials', 'retainer']).nullable()
  })
});

export const WizardTeamSchema = z.object({
  invites: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .email('Введите корректный e-mail')
    )
    .max(12, 'Максимум 12 приглашений за раз'),
  inviteMessage: z
    .string()
    .trim()
    .max(280, 'Сообщение не должно превышать 280 символов')
    .nullable(),
  inviteLinkEnabled: z.boolean()
});

export const WizardDraftSchema = z.object({
  step: z.number().int().min(0).max(2).nullable(),
  selection: WizardSelectionSchema,
  details: WizardDetailsSchema,
  team: WizardTeamSchema
});

export type WizardSelection = z.infer<typeof WizardSelectionSchema>;
export type WizardDetails = z.infer<typeof WizardDetailsSchema>;
export type WizardTeam = z.infer<typeof WizardTeamSchema>;
export type WizardDraft = z.infer<typeof WizardDraftSchema>;

export function createInitialWizardDraft(): WizardDraft {
  return {
    step: 0,
    selection: { mode: 'blank', templateId: null },
    details: {
      name: '',
      description: null,
      visibility: 'private',
      stage: 'discovery',
      deadline: null,
      tags: [],
      finance: {
        budget: null,
        currency: 'RUB',
        paymentType: 'fixed'
      }
    },
    team: {
      invites: [],
      inviteMessage: null,
      inviteLinkEnabled: true
    }
  };
}
