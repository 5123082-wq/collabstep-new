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
        'group flex w-full items-center gap-3 rounded-xl p-3 my-1 transition-all duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
        'hover:shadow-lg hover:scale-[1.03]',
        expanded ? 'justify-start' : 'justify-center'
      )}
      aria-label={expanded ? undefined : action.label}
    >
      <div className="relative flex items-center justify-center">
        <Icon className="h-6 w-6 text-neutral-200" aria-hidden="true" />
        {showBadge ? (
          <span className="absolute -top-1 -right-1">
            <Badge className="px-1 py-0 text-[10px] leading-3">{badge}</Badge>
          </span>
        ) : null}
      </div>
      {expanded ? <span className="text-sm text-neutral-100/90">{action.label}</span> : null}
    </button>
  );
}
