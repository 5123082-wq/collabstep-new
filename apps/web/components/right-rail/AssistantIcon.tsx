'use client';

import { forwardRef, type SVGProps } from 'react';
import type { LucideIcon } from 'lucide-react';

type AssistantIconProps = SVGProps<SVGSVGElement>;

const AssistantIcon = forwardRef<SVGSVGElement, AssistantIconProps>(function AssistantIcon(
  { strokeWidth = 2, strokeLinecap = 'round', strokeLinejoin = 'round', ...props },
  ref
) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap as AssistantIconProps['strokeLinecap']}
      strokeLinejoin={strokeLinejoin as AssistantIconProps['strokeLinejoin']}
      {...props}
    >
      <path d="m12 3 1.9 3.8 4.2.6-3.1 3 0.7 4.3-3.7-2-3.7 2 0.7-4.3-3.1-3 4.2-.6z" />
      <path d="M6 19h12" />
      <path d="M9 22h6" />
    </svg>
  );
});

export default AssistantIcon as unknown as LucideIcon;

