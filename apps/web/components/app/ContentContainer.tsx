'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type ContentContainerProps = {
  children: ReactNode;
  className?: string;
  hasRailOffset?: boolean;
};

export default function ContentContainer({ children, className, hasRailOffset }: ContentContainerProps) {
  const pathname = usePathname();
  const isMarketRoute = pathname?.startsWith('/app/market');
  const isProjectRoute = pathname?.startsWith('/app/project') || pathname?.startsWith('/app/projects');
  const isMarketingRoute = pathname?.startsWith('/app/marketing');

  return (
    <main
      data-app-main
      className={clsx(
        'content-area relative flex-1 overflow-y-auto py-10',
        className,
        isMarketRoute && 'market-route',
        isProjectRoute && 'project-route',
        isMarketingRoute && 'marketing-route',
        hasRailOffset && 'has-rail-offset'
      )}
      aria-live="polite"
    >
      <div className="flex w-full flex-col gap-8 pb-16">{children}</div>
    </main>
  );
}
