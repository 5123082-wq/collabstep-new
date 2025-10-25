'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { QuickAction } from '@/types/quickActions';

const ICON_COLUMN_WIDTH = 56;
const ICON_SIZE_REM = 1.2; // 20% smaller than the previous 1.5rem (24px) icon size

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
  const iconSize = `${ICON_SIZE_REM}rem`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative my-1 grid w-full items-center overflow-hidden rounded-xl py-2 transition-all duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
        'hover:shadow-lg hover:scale-[1.03]',
        expanded ? 'pl-3 pr-0' : 'px-0'
      )}
      style={{ gridTemplateColumns }}
      aria-label={expanded ? undefined : action.label}
    >
      <span
        aria-hidden={!expanded}
        className={cn(
          'block overflow-hidden whitespace-nowrap pr-3 text-right text-sm opacity-0 transition-[max-width,opacity,transform] duration-200 ease-out text-neutral-500 dark:text-neutral-200',
          expanded ? 'max-w-[188px] opacity-100 translate-x-0' : 'max-w-0 -translate-x-1'
        )}
      >
        {action.label}
      </span>
      <span className="flex h-10 items-center justify-center justify-self-center" style={{ width: iconColumnWidth }}>
        <span className="relative flex h-10 w-10 items-center justify-center">
          <Icon
            className="text-neutral-500 dark:text-neutral-200"
            style={{ height: iconSize, width: iconSize }}
            aria-hidden="true"
          />
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
