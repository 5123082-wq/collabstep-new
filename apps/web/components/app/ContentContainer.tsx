'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

type ContentContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function ContentContainer({ children, className }: ContentContainerProps) {
  return (
    <main
      data-app-main
      className={clsx('content-area relative flex-1 overflow-y-auto py-10', className)}
      aria-live="polite"
    >
      <div className="flex w-full flex-col gap-8 pb-16">{children}</div>
    </main>
  );
}
