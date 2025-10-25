'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { QuickAction } from '@/types/quickActions';

const COLLAPSED_RAIL_WIDTH = 56;
const RAIL_HORIZONTAL_PADDING = 8; // matches HoverRail container padding (p-2)
const ICON_COLUMN_WIDTH = COLLAPSED_RAIL_WIDTH - RAIL_HORIZONTAL_PADDING * 2;

interface RailItemProps {
  action: QuickAction;
  expanded: boolean;
  onClick: () => void;
  badge?: number | undefined;
}

export function RailItem({ action, expanded, onClick, badge }: RailItemProps) {
  const Icon = action.icon;
  const showBadge = typeof badge === 'number' && badge > 0;
  const iconColumnWidth = `${ICON_COLUMN_WIDTH}px`;
  const gridTemplateColumns = expanded
    ? `minmax(0,1fr) ${iconColumnWidth}`
    : `0px ${iconColumnWidth}`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative my-0.5 grid w-full items-center overflow-hidden rounded-xl py-1.5 transition-all duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
        'hover:shadow-lg hover:scale-[1.03]',
        expanded ? 'pl-3 pr-0' : 'px-0'
      )}
      style={{ gridTemplateColumns }}
      aria-label={expanded ? undefined : action.label}
    >
      <span
        aria-hidden={!expanded}
        className={cn(
          'block overflow-hidden whitespace-nowrap text-right text-sm text-neutral-500 opacity-0 transition-[max-width,opacity] duration-200 ease-out dark:text-neutral-200',
          expanded ? 'max-w-[188px] pr-3 opacity-100' : 'max-w-0 pr-0'
        )}
      >
        {action.label}
      </span>
      <span className="flex h-10 items-center justify-center" style={{ width: iconColumnWidth }}>
        <span className="relative flex h-10 w-10 items-center justify-center text-neutral-500 dark:text-neutral-200">
          <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
          {showBadge ? (
            <span className="absolute -top-1 -right-1">
              <Badge className="px-1 py-0 text-[10px] leading-3">{badge}</Badge>
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}
