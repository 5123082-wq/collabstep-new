import type { ReactNode } from 'react';

export function EmptyState({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div
      role="status"
      className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-10 text-center text-sm text-neutral-400"
    >
      <p>{message}</p>
      {children}
    </div>
  );
}

export function ErrorState({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100" role="alert">
      <p>{message}</p>
      {children}
    </div>
  );
}
