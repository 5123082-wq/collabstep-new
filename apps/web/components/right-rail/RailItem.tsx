'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { QuickAction } from '@/types/quickActions';

interface RailItemProps {
  action: QuickAction;
  expanded: boolean;
  onClick: () => void;
  badge?: number | undefined;
}

export function RailItem({ action, expanded, onClick, badge }: RailItemProps) {
  const Icon = action.icon;
  const showBadge = typeof badge === 'number' && badge > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative my-1 flex w-full items-center justify-end gap-3 overflow-hidden rounded-xl py-2 pl-3 pr-0 transition-all duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
        'hover:shadow-lg hover:scale-[1.03]'
      )}
      aria-label={expanded ? undefined : action.label}
    >
      <span
        aria-hidden={!expanded}
        className={cn(
          'mr-auto block overflow-hidden whitespace-nowrap text-sm text-neutral-100/90 opacity-0 transition-[max-width,opacity,transform] duration-200 ease-out',
          expanded ? 'max-w-[188px] opacity-100 translate-x-0' : 'max-w-0 -translate-x-1'
        )}
      >
        {action.label}
      </span>
      <span className="grid w-14 flex-shrink-0 place-items-center">
        <span className="relative flex h-10 w-10 items-center justify-center">
          <Icon className="h-6 w-6 text-neutral-200" aria-hidden="true" />
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
