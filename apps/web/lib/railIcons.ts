import {
  BookmarkPlus,
  CalendarPlus,
  Rocket,
  Sparkles,
  SquarePen,
  type LucideIcon
} from 'lucide-react';

export const railIconOptions = [
  { id: 'bookmark-plus', label: 'Закладка', icon: BookmarkPlus },
  { id: 'calendar-plus', label: 'Календарь', icon: CalendarPlus },
  { id: 'sparkles', label: 'Искра', icon: Sparkles },
  { id: 'rocket', label: 'Ракета', icon: Rocket },
  { id: 'square-pen', label: 'Заметка', icon: SquarePen }
] as const;

export type RailIconId = (typeof railIconOptions)[number]['id'];

export const DEFAULT_RAIL_ICON_ID: RailIconId = railIconOptions[0]?.id ?? 'bookmark-plus';

export function resolveRailIcon(iconId: string): LucideIcon {
  const option = railIconOptions.find((item) => item.id === iconId);
  if (option) {
    return option.icon;
  }
  return railIconOptions[0]?.icon ?? BookmarkPlus;
}

