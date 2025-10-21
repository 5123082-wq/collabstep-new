export const flags = {
  PROJECTS_V1: process.env.FEATURE_PROJECTS_V1 === '1',
  PROJECTS_VIEWS: process.env.FEATURE_PROJECTS_VIEWS === '1',
  AI_V1: process.env.FEATURE_AI_V1 === '1',
  MARKETPLACE_ATTACH: process.env.FEATURE_MARKETPLACE_ATTACH === '1'
} as const;

export type FlagName = keyof typeof flags;
