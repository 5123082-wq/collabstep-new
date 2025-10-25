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

  const inlinePadding = isMarketRoute ? '20px' : isProjectRoute ? '28px' : undefined;
  const mainStyle: CSSProperties | undefined = inlinePadding
    ? { ['--content-inline-padding' as const]: inlinePadding }
    : undefined;

  return (
    <main
      data-app-main
      style={mainStyle}
      className={clsx('content-area relative flex-1 overflow-y-auto py-10 sm:py-12', className)}
      aria-live="polite"
    >
      <div className="flex w-full flex-col gap-8 pb-16">{children}</div>
    </main>
  );
}
