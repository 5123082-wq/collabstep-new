export const flags = {
  PROJECTS_V1: process.env.FEATURE_PROJECTS_V1 === '1'
} as const;

export type FlagName = keyof typeof flags;
