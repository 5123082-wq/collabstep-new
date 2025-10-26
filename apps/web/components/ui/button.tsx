'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-[color:var(--accent-border)] bg-[color:var(--accent-bg-strong)] text-[color:var(--accent-foreground)] shadow-[0_16px_32px_-22px_rgba(99,102,241,0.85)] hover:border-[color:var(--accent-border-strong)] hover:bg-[color:var(--accent-bg)] active:border-[color:var(--accent-border-strong)] active:bg-[color:var(--accent-bg-strong)]',
  secondary:
    'border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] text-[color:var(--text-primary)] hover:border-[color:var(--surface-border-strong)] hover:bg-[color:var(--surface-base)] active:bg-[color:var(--surface-muted)]',
  ghost:
    'border-transparent bg-transparent text-[color:var(--text-secondary)] hover:border-[color:var(--surface-border-subtle)] hover:bg-[color:var(--surface-muted)] active:bg-[color:var(--surface-muted)]',
  danger:
    'border-transparent bg-[rgba(239,68,68,0.16)] text-[color:var(--text-primary)] hover:bg-[rgba(248,113,113,0.22)] active:bg-[rgba(239,68,68,0.28)]'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-lg px-3 text-sm',
  md: 'h-11 rounded-xl px-4 text-sm',
  lg: 'h-12 rounded-2xl px-6 text-base'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      data-variant={variant}
      data-loading={loading || undefined}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-border-strong)]',
        'border shadow-sm hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.65)] active:translate-y-0 active:shadow-sm disabled:translate-y-0 disabled:shadow-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--accent-border-strong)] border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  );
});
