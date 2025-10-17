const navFlag = (process.env.NAV_V1 ?? 'on').toLowerCase();
export const NAV_V1 = navFlag === 'on';
export const APP_LOCALE = process.env.APP_LOCALE ?? 'ru';

function resolveFlagValue(...candidates: Array<string | undefined>): string | undefined {
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const normalized = candidate.trim().toLowerCase();
      if (normalized.length > 0) {
        return normalized;
      }
    }
  }
  return undefined;
}

const demoBadgesFlag = resolveFlagValue(
  process.env.NEXT_PUBLIC_UI_DEMO_BADGES,
  process.env.UI_DEMO_BADGES
) ?? 'off';
export const UI_DEMO_BADGES = demoBadgesFlag === 'on';

const roadmapHintsFlag = resolveFlagValue(
  process.env.NEXT_PUBLIC_ROADMAP_HINTS,
  process.env.ROADMAP_HINTS
) ?? 'off';
export const ROADMAP_HINTS = roadmapHintsFlag === 'on';
