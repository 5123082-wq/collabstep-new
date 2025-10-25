'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { QuickAction } from '@/types/quickActions';

const ICON_COLUMN_WIDTH = 56;
const LABEL_MAX_WIDTH = 176;

interface RailItemProps {
  action: QuickAction;
  expanded: boolean;
  onClick: () => void;
  badge?: number | undefined;
}

export function RailItem({ action, expanded, onClick, badge }: RailItemProps) {
  const Icon = action.icon;
  const showBadge = typeof badge === 'number' && badge > 0;
  const gridTemplateColumns = expanded
    ? `${LABEL_MAX_WIDTH}px ${ICON_COLUMN_WIDTH}px`
    : `0px ${ICON_COLUMN_WIDTH}px`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative my-0.5 grid w-full items-center justify-end overflow-hidden rounded-xl py-1 transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
        expanded ? 'gap-x-3 pl-3' : 'px-0'
      )}
      style={{ gridTemplateColumns }}
      aria-label={expanded ? undefined : action.label}
    >
      <span
        aria-hidden={!expanded}
        className={cn(
          'block overflow-hidden whitespace-nowrap text-right text-sm text-neutral-500 opacity-0 transition-[max-width,opacity] duration-200 ease-out dark:text-neutral-200',
          expanded ? 'max-w-full opacity-100' : 'max-w-0'
        )}
      >
        {action.label}
      </span>
      <span className="flex h-10 items-center justify-center justify-self-center" style={{ width: `${ICON_COLUMN_WIDTH}px` }}>
        <span className="relative flex h-10 w-10 items-center justify-center">
          <Icon className="h-[19px] w-[19px] text-neutral-500 dark:text-neutral-200" aria-hidden="true" />
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
