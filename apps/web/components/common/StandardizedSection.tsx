'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type Breadcrumb = {
  label: string;
  href?: string;
};

type QuickAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary';
};

type StandardizedSectionProps = {
  title: string;
  description: string;
  breadcrumbs?: Breadcrumb[];
  quickActions?: QuickAction[];
  children?: ReactNode;
  className?: string;
};

export default function StandardizedSection({
  title,
  description,
  breadcrumbs,
  quickActions,
  children,
  className
}: StandardizedSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex flex-wrap items-center gap-x-2 text-sm text-neutral-400" aria-label="Хлебные крошки">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="transition hover:text-neutral-100">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-neutral-200' : undefined}>{crumb.label}</span>
                )}
                {!isLast ? <span className="text-neutral-600">/</span> : null}
              </span>
            );
          })}
        </nav>
      )}

      {/* Header with actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="text-sm text-neutral-400">{description}</p>
        </div>
        {quickActions && quickActions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {quickActions.map((action, index) => {
              const baseClasses = 'rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400';
              
              if (action.variant === 'primary') {
                const classes = cn(
                  baseClasses,
                  'border border-indigo-500/40 bg-indigo-500/10 text-indigo-100 hover:border-indigo-400 hover:bg-indigo-500/20'
                );
                
                if (action.href) {
                  return (
                    <Link key={index} href={action.href} className={classes}>
                      {action.label}
                    </Link>
                  );
                }
                return (
                  <button key={index} type="button" onClick={action.onClick} className={classes}>
                    {action.label}
                  </button>
                );
              }
              
              const classes = cn(
                baseClasses,
                'border border-neutral-800 text-neutral-200 hover:border-neutral-700 hover:text-white'
              );
              
              if (action.href) {
                return (
                  <Link key={index} href={action.href} className={classes}>
                    {action.label}
                  </Link>
                );
              }
              return (
                <button key={index} type="button" onClick={action.onClick} className={classes}>
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}

