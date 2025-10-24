import {
  featureFlagEntries,
  featureFlagRegistry,
  getFeatureFlagSnapshot,
  isFeatureEnabled as resolveFeatureEnabled,
  resolveFlagValue,
  type FeatureFlagDefinition,
  type FeatureFlagKey
} from '../../../config/feature-flags';

export const NAV_V1 = resolveFlagValue(process.env.NAV_V1, true);
export const APP_LOCALE = process.env.APP_LOCALE ?? 'ru';

export const featureFlags = Object.freeze(getFeatureFlagSnapshot(process.env));

export type FeatureFlagsSnapshot = typeof featureFlags;

export const activeFeatureFlags = Object.freeze(
  (Object.entries(featureFlags) as [FeatureFlagKey, boolean][]) // narrow tuple type for TS
    .filter(([, enabled]) => enabled)
    .map(([name]) => name)
);

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return resolveFeatureEnabled(flag, process.env);
}

export function getFeatureFlagDefinition(flag: FeatureFlagKey): FeatureFlagDefinition {
  return featureFlagRegistry[flag];
}

export function getFeatureFlagEnv(flag: FeatureFlagKey): string {
  return featureFlagRegistry[flag].env;
}

export const FEATURE_FLAG_DEFINITIONS = featureFlagEntries.map(([name, definition]) => ({
  name,
  ...definition
}));

export type FeatureFlagName = FeatureFlagKey;

export { featureFlagRegistry };
export type { FeatureFlagDefinition, FeatureFlagKey };
