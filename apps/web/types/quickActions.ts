import type { LucideIcon } from 'lucide-react';

export type RailIntent = 'route' | 'sheet' | 'dialog' | 'command';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  intent: RailIntent;
  payload?: Record<string, unknown>;
  featureFlag?: string;
  permission?: string;
  badgeSelector?: (state: unknown) => number;
  section?: 'actions' | 'communication' | string;
}
