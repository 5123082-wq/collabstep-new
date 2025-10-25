import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';

type MarketingCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  accent?: 'primary' | 'neutral';
  columns?: 1 | 2 | 3 | 4;
};

export default function MarketingCard({
  title,
  description,
  children,
  footer,
  accent = 'neutral',
  columns = 1
}: MarketingCardProps) {
  const minWidthByColumns: Record<1 | 2 | 3 | 4, string> = {
    1: '100%',
    2: '320px',
    3: '280px',
    4: '220px'
  };

  const gridStyle = {
    '--cs-grid-min': minWidthByColumns[columns],
    '--cs-grid-gap': '12px'
  } as CSSProperties;

  return (
    <section
      className={clsx(
        'space-y-4 rounded-3xl border p-6 shadow-[0_0_20px_rgba(0,0,0,0.15)]',
        accent === 'primary'
          ? 'border-indigo-500/40 bg-indigo-500/10'
          : 'border-neutral-900 bg-neutral-950/60'
      )}
    >
      <header className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description ? <p className="text-sm text-neutral-400">{description}</p> : null}
      </header>
      {children ? (
        <div className="cs-auto-grid" style={gridStyle}>
          {children}
        </div>
      ) : null}
      {footer ? <div className="border-t border-neutral-800/60 pt-4 text-xs text-neutral-400">{footer}</div> : null}
    </section>
  );
}
