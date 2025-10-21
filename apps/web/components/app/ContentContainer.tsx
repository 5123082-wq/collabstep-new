'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type ContentContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function ContentContainer({ children, className }: ContentContainerProps) {
  const pathname = usePathname();
  const isMarketRoute = pathname?.startsWith('/market');
  const isProjectRoute = pathname?.startsWith('/project');

  return (
    <main
      className={clsx(
        'content-area relative flex-1 overflow-y-auto px-8 py-10 sm:px-10 lg:px-12',
        isMarketRoute && 'px-4 sm:px-6 lg:px-10',
        isProjectRoute && 'px-4 sm:px-6 lg:px-10 xl:px-12',
        className
      )}
      aria-live="polite"
    >
      <div
        className={clsx(
          'mx-auto flex w-full flex-col gap-8 pb-16',
          isMarketRoute ? 'max-w-7xl' : isProjectRoute ? 'max-w-none' : 'max-w-4xl'
        )}
      >
        {children}
      </div>
    </main>
  );
}
