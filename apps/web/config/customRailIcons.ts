import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const { Bookmark, Link, Rocket, Sparkles, Star, Zap, ExternalLink, Flame, Calendar, BookOpen } = Icons;

export const CUSTOM_RAIL_ICONS = {
  link: { icon: (Link ?? ExternalLink) as LucideIcon, label: 'Ссылка' },
  star: { icon: (Star ?? Bookmark) as LucideIcon, label: 'Избранное' },
  spark: { icon: (Sparkles ?? Star) as LucideIcon, label: 'Идеи' },
  rocket: { icon: (Rocket ?? Zap) as LucideIcon, label: 'Запуск' },
  note: { icon: (BookOpen ?? Bookmark) as LucideIcon, label: 'Заметка' },
  calendar: { icon: (Calendar ?? ExternalLink) as LucideIcon, label: 'Календарь' },
  flame: { icon: (Flame ?? Zap) as LucideIcon, label: 'Важное' },
  zap: { icon: (Zap ?? Sparkles) as LucideIcon, label: 'Быстро' },
  external: { icon: (ExternalLink ?? Link ?? Bookmark) as LucideIcon, label: 'Внешняя ссылка' }
} as const satisfies Record<string, { icon: LucideIcon; label: string }>;

export type CustomRailIconKey = keyof typeof CUSTOM_RAIL_ICONS;

export const CUSTOM_RAIL_ICON_KEYS = Object.keys(CUSTOM_RAIL_ICONS) as CustomRailIconKey[];

export const DEFAULT_CUSTOM_RAIL_ICON: CustomRailIconKey = 'link';

export function resolveCustomRailIcon(key: CustomRailIconKey): LucideIcon {
  return CUSTOM_RAIL_ICONS[key]?.icon ?? CUSTOM_RAIL_ICONS[DEFAULT_CUSTOM_RAIL_ICON].icon;
}

export function isCustomRailIconKey(value: unknown): value is CustomRailIconKey {
  return typeof value === 'string' && value in CUSTOM_RAIL_ICONS;
}
