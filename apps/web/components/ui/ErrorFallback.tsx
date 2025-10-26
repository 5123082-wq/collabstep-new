'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type SupportLink = {
  href: string;
  label: string;
};

type ErrorFallbackProps = {
  title: string;
  description: string;
  reset: () => void;
  links?: SupportLink[];
  onRetry?: () => void | boolean | Promise<void | boolean>;
};

export default function ErrorFallback({ title, description, reset, links = [], onRetry }: ErrorFallbackProps) {
  const [retrySignal, setRetrySignal] = useState(0);

  useEffect(() => {
    if (retrySignal === 0) {
      return;
    }

    const run = async () => {
      const shouldReset = await onRetry?.();
      if (shouldReset !== false) {
        reset();
      }
    };

    void run();
  }, [onRetry, reset, retrySignal]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-[color:var(--text-primary)]">{title}</h1>
        <p className="max-w-md text-sm text-[color:var(--text-tertiary)]">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setRetrySignal((value) => value + 1)}
          className="rounded-full border border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--accent-foreground)] transition hover:bg-[color:var(--accent-bg-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-border-strong)]"
        >
          Повторить попытку
        </button>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-[color:var(--surface-border-subtle)] px-4 py-2 text-sm font-semibold text-[color:var(--text-secondary)] transition hover:border-[color:var(--accent-border)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-border-strong)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
