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
      className={clsx(
        'content-area relative flex-1 overflow-y-auto px-8 py-10 sm:px-10 lg:px-12',
        className
      )}
      aria-live="polite"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-16">{children}</div>
    </main>
  );
}
