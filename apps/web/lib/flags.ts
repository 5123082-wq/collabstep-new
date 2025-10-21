/**
 * Фичи включены "по умолчанию".
 * ENV можно использовать только чтобы ОТКЛЮЧИТЬ: FEATURE_* = 0.
 * FEATURE_* = 1 явным образом включает, любое другое значение -> дефолт.
 */
function onByDefault(name: string, defaultOn = true) {
  const v = process.env[name];
  if (v === '0') return false;
  if (v === '1') return true;
  return defaultOn;
}

export const flags = {
  PROJECTS_V1: onByDefault('FEATURE_PROJECTS_V1', true),
  PROJECTS_VIEWS: onByDefault('FEATURE_PROJECTS_VIEWS', true),
  AI_V1: onByDefault('FEATURE_AI_V1', false),
  MARKETPLACE_ATTACH: onByDefault('FEATURE_MARKETPLACE_ATTACH', false),
} as const;

export type FlagName = keyof typeof flags;
