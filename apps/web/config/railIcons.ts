import {
  Bell,
  CalendarDays,
  FileText,
  ListTodo,
  MessageSquare,
  PlusCircle,
  Rocket,
  Sparkles,
  Star,
  UserPlus
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconLabelMap = {
  plusCircle: 'Плюс',
  listTodo: 'Список дел',
  messageSquare: 'Сообщения',
  bell: 'Колокол',
  userPlus: 'Приглашение',
  sparkles: 'Искры',
  star: 'Звезда',
  calendarDays: 'Календарь',
  fileText: 'Документ',
  rocket: 'Ракета'
} as const;

export const railIconRegistry = {
  plusCircle: PlusCircle,
  listTodo: ListTodo,
  messageSquare: MessageSquare,
  bell: Bell,
  userPlus: UserPlus,
  sparkles: Sparkles,
  star: Star,
  calendarDays: CalendarDays,
  fileText: FileText,
  rocket: Rocket
} as const;

export type RailIconId = keyof typeof railIconRegistry;

export function isValidRailIconId(value: unknown): value is RailIconId {
  return typeof value === 'string' && value in railIconRegistry;
}

export function resolveRailIcon(icon: RailIconId | string): LucideIcon {
  if (icon in railIconRegistry) {
    return railIconRegistry[icon as RailIconId];
  }
  return railIconRegistry.plusCircle;
}

export const railIconOptions = (Object.keys(railIconRegistry) as RailIconId[]).map((id) => ({
  id,
  Icon: railIconRegistry[id],
  label: iconLabelMap[id]
}));

