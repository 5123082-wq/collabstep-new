'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const variantClasses: Record<AlertVariant, string> = {
  info: 'before:bg-[color:var(--accent-border-strong)]',
  success: 'before:bg-[rgba(34,197,94,0.7)]',
  warning: 'before:bg-[rgba(250,204,21,0.75)]',
  danger: 'before:bg-[rgba(248,113,113,0.8)]'
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, variant = 'info', role, ...props },
  ref
) {
  const resolvedRole = role ?? (variant === 'danger' ? 'alert' : 'status');

  return (
    <div
      ref={ref}
      role={resolvedRole}
      aria-live={variant === 'danger' ? 'assertive' : 'polite'}
      data-variant={variant}
      className={cn(
        'relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-[color:var(--surface-border-strong)] bg-[color:var(--surface-base)] px-5 py-4 text-[color:var(--text-primary)] shadow-[0_18px_42px_-30px_rgba(15,23,42,0.85)] transition-colors duration-200 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:rounded-full before:content-[""]',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});

export const AlertTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function AlertTitle(
  { className, ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      className={cn('text-sm font-semibold tracking-tight text-[color:var(--text-primary)]', className)}
      {...props}
    />
  );
});

export const AlertDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(function AlertDescription(
  { className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn('text-sm leading-relaxed text-[color:var(--text-secondary)]', className)}
      {...props}
    />
  );
});
