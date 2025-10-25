'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';

type ContentContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function ContentContainer({ children, className }: ContentContainerProps) {
  const pathname = usePathname();
  const isMarketRoute = pathname?.startsWith('/market');
  const isProjectRoute = pathname?.startsWith('/project');
  const inlinePadding = isProjectRoute ? '32px' : isMarketRoute ? '20px' : '24px';
  const style = {
    '--content-inline-padding': inlinePadding
  } as CSSProperties;

  return (
    <main
      data-app-main
      className={clsx('content-area relative flex-1 min-w-0 overflow-y-auto py-10', className)}
      style={style}
      aria-live="polite"
    >
      <div className="flex w-full flex-col gap-8 pb-16">{children}</div>
    </main>
  );
}
