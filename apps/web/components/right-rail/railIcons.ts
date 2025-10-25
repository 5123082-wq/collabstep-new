import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type RailIconOption = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const iconRegistry = LucideIcons as Record<string, unknown>;
const FALLBACK_ICON = (() => {
  const primary = iconRegistry['Sparkles'];
  if (typeof primary === 'function') {
    return primary as LucideIcon;
  }
  const secondary = iconRegistry['Star'];
  if (typeof secondary === 'function') {
    return secondary as LucideIcon;
  }
  return (() => null) as unknown as LucideIcon;
})();

const ICON_DEFINITIONS = [
  { value: 'Sparkles', label: 'Искра' },
  { value: 'Rocket', label: 'Ракета' },
  { value: 'Flag', label: 'Флаг' },
  { value: 'ShieldCheck', label: 'Щит' },
  { value: 'Target', label: 'Цель' },
  { value: 'Zap', label: 'Молния' },
  { value: 'Star', label: 'Звезда' },
  { value: 'CalendarPlus', label: 'Календарь' },
  { value: 'FilePlus2', label: 'Документ' },
  { value: 'ClipboardList', label: 'Задачи' },
  { value: 'FolderKanban', label: 'Доска' },
  { value: 'AppWindow', label: 'Окно' }
] as const;

export const railIconOptions: RailIconOption[] = ICON_DEFINITIONS.map(({ value, label }) => ({
  value,
  label,
  icon: resolveIcon(value)
}));

export const DEFAULT_RAIL_ICON = railIconOptions[0]!.value;

export function getRailIconComponent(value: string): LucideIcon {
  return resolveIcon(value);
}

function resolveIcon(name: string): LucideIcon {
  const candidate = iconRegistry[name];
  if (typeof candidate === 'function') {
    return candidate as LucideIcon;
  }
  return FALLBACK_ICON;
}
