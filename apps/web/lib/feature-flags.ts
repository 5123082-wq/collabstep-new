import {
  FEATURE_FLAG_BY_NAME,
  FEATURE_FLAG_DEFINITIONS,
  type FeatureFlagDefinition,
  type FeatureFlagName
} from '@/config/featureFlags';

const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on', 'enabled']);
const FALSY_VALUES = new Set(['0', 'false', 'no', 'off', 'disabled']);

function resolveBooleanFlagValue(rawValue: string | undefined, fallback: boolean): boolean {
  if (rawValue === undefined) {
    return fallback;
  }

  const normalized = rawValue.trim().toLowerCase();
  if (normalized.length === 0) {
    return fallback;
  }

  if (TRUTHY_VALUES.has(normalized)) {
    return true;
  }

  if (FALSY_VALUES.has(normalized)) {
    return false;
  }

  return fallback;
}

export const NAV_V1 = resolveBooleanFlagValue(process.env.NAV_V1 ?? 'on', true);
export const APP_LOCALE = process.env.APP_LOCALE ?? 'ru';

export const featureFlags = Object.freeze(
  FEATURE_FLAG_DEFINITIONS.reduce<Record<FeatureFlagName, boolean>>((acc, definition) => {
    acc[definition.name] = resolveBooleanFlagValue(process.env[definition.env], definition.defaultValue);
    return acc;
  }, {} as Record<FeatureFlagName, boolean>)
);

export type FeatureFlagsSnapshot = typeof featureFlags;

export const activeFeatureFlags = Object.freeze(
  (Object.entries(featureFlags) as [FeatureFlagName, boolean][]) // narrow tuple type for TS
    .filter(([, enabled]) => enabled)
    .map(([name]) => name)
);

export function isFeatureEnabled(flag: FeatureFlagName): boolean {
  return featureFlags[flag];
}

export function getFeatureFlagDefinition(flag: FeatureFlagName): FeatureFlagDefinition {
  return FEATURE_FLAG_BY_NAME[flag];
}

export function getFeatureFlagEnv(flag: FeatureFlagName): string {
  return FEATURE_FLAG_BY_NAME[flag].env;
}

export { FEATURE_FLAG_DEFINITIONS, FEATURE_FLAG_BY_NAME };
export type { FeatureFlagDefinition, FeatureFlagName };
