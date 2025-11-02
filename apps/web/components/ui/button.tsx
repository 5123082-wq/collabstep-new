'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'trendy';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-foreground)] shadow-[0_16px_32px_-22px_rgba(79,70,229,0.85)] hover:border-[color:var(--button-primary-border-strong)] hover:bg-[color:var(--button-primary-bg-hover)] active:border-[color:var(--button-primary-border-strong)] active:bg-[color:var(--button-primary-bg-active)] focus-visible:outline-[color:var(--button-primary-border-strong)]',
  secondary:
    'border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] text-[color:var(--text-primary)] hover:border-[color:var(--surface-border-strong)] hover:bg-[color:var(--surface-base)] active:bg-[color:var(--surface-muted)] focus-visible:outline-[color:var(--surface-border-strong)]',
  ghost:
    'border-transparent bg-transparent text-[color:var(--button-ghost-foreground)] hover:border-[color:var(--surface-border-subtle)] hover:bg-[color:var(--surface-muted)] active:bg-[color:var(--surface-muted)] focus-visible:outline-[color:var(--surface-border-strong)]',
  danger:
    'border-[color:var(--button-danger-border)] bg-[color:var(--button-danger-bg)] text-[color:var(--button-danger-foreground)] hover:border-[color:var(--button-danger-border-strong)] hover:bg-[color:var(--button-danger-bg-hover)] active:border-[color:var(--button-danger-border-strong)] active:bg-[color:var(--button-danger-bg-active)] focus-visible:outline-[color:var(--button-danger-border-strong)]',
  trendy:
    'border-[color:var(--button-trendy-border)] bg-[color:var(--button-trendy-bg)] text-[color:var(--button-trendy-foreground)] shadow-[0_16px_32px_-22px_rgba(71,73,115,0.65)] hover:border-[color:var(--button-trendy-border-strong)] hover:bg-[color:var(--button-trendy-bg-hover)] active:border-[color:var(--button-trendy-border-strong)] active:bg-[color:var(--button-trendy-bg-active)] focus-visible:outline-[color:var(--button-trendy-border-strong)]'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-lg px-2.5 text-sm',
  md: 'h-10 rounded-xl px-3.5 text-sm',
  lg: 'h-10 rounded-2xl px-5 text-base'
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
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'border shadow-sm hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.65)] active:translate-y-0 active:shadow-sm disabled:translate-y-0 disabled:shadow-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  );
});
