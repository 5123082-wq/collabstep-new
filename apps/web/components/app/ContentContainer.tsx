'use client';

import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

type ContentContainerProps = {
  children: ReactNode;
  className?: string;
  railOffset?: number;
};

export default function ContentContainer({ children, className, railOffset = 0 }: ContentContainerProps) {
  const inlineStyle = railOffset > 0 ? ({ '--rail-offset': `${railOffset}px` } as CSSProperties) : undefined;

  return (
    <main
      data-app-main
      className={clsx('content-area relative flex-1 overflow-y-auto py-10', className)}
      style={inlineStyle}
      aria-live="polite"
    >
      <div className="flex w-full flex-col gap-8 pb-16">{children}</div>
    </main>
  );
}
