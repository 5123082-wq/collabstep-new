import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FeatureComingSoonProps {
  title?: string;
  description?: ReactNode;
  className?: string;
}

export default function FeatureComingSoon({
  title = 'Скоро появится новая возможность',
  description = 'Мы активно работаем над этим разделом. Загляните сюда чуть позже, чтобы увидеть обновления.',
  className
}: FeatureComingSoonProps) {
  return (
    <section
      className={cn(
        'flex min-h-[360px] flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/60 px-6 py-14 text-center shadow-inner',
        className
      )}
    >
      <div className="space-y-3">
        <span className="inline-flex items-center rounded-full border border-neutral-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
          Soon
        </span>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">{title}</h1>
        <p className="mx-auto max-w-2xl text-sm text-neutral-400 md:text-base">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-neutral-400">
        <Link
          href="/app/dashboard"
          className="inline-flex items-center justify-center rounded-full border border-neutral-800 px-5 py-2 font-semibold text-neutral-200 transition hover:border-indigo-400/60 hover:text-white"
        >
          Перейти в дашборд
        </Link>
        <span className="text-xs uppercase tracking-wide text-neutral-500">
          Больше обновлений совсем скоро
        </span>
      </div>
    </section>
  );
}
