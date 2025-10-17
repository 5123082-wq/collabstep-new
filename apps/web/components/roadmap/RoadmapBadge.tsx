import clsx from 'clsx';
import Link from 'next/link';
import { ROADMAP_HINTS, UI_DEMO_BADGES } from '@/lib/feature-flags';

type RoadmapBadgeStatus = 'DEMO' | 'COMING_SOON' | 'LIVE';

type RoadmapBadgeProps = {
  status: RoadmapBadgeStatus;
  stageHint: string;
  roadmapHref?: string;
  linkLabel?: string;
  className?: string;
};

const STATUS_LABELS: Record<RoadmapBadgeStatus, string> = {
  DEMO: 'DEMO',
  COMING_SOON: 'SOON',
  LIVE: 'LIVE'
};

const STATUS_STYLES: Record<RoadmapBadgeStatus, string> = {
  DEMO: 'border-amber-400/60 bg-amber-400/10 text-amber-100',
  COMING_SOON: 'border-indigo-400/60 bg-indigo-500/10 text-indigo-100',
  LIVE: 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100'
};

export default function RoadmapBadge({
  status,
  stageHint,
  roadmapHref,
  linkLabel,
  className
}: RoadmapBadgeProps) {
  if (!UI_DEMO_BADGES || !ROADMAP_HINTS) {
    return null;
  }

  const hintEnabled = stageHint && stageHint !== '—';

  return (
    <div className={clsx('flex flex-wrap items-center gap-2 text-xs text-neutral-400', className)} data-testid="roadmap-badge">
      <span
        className={clsx(
          'rounded-full border px-3 py-1 font-semibold uppercase tracking-wide shadow-sm shadow-neutral-950/40',
          STATUS_STYLES[status]
        )}
      >
        {STATUS_LABELS[status]}
      </span>
      {hintEnabled ? <span className="text-neutral-400">Этапы {stageHint}</span> : null}
      {roadmapHref && hintEnabled ? (
        <Link
          href={roadmapHref}
          className="rounded-md border border-transparent px-2 py-1 text-xs text-indigo-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          {linkLabel ?? 'Дорожная карта'}
        </Link>
      ) : null}
    </div>
  );
}
