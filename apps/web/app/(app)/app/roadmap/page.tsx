import Link from 'next/link';
import { ROADMAP_STAGES, type RoadmapStage, type RoadmapStageStatus } from '@/lib/roadmap';

const STATUS_ICON: Record<RoadmapStageStatus, string> = {
  done: '✅',
  in_progress: '🛠️',
  planned: '⏳'
};

function StageCard({ stage }: { stage: RoadmapStage }) {
  const icon = STATUS_ICON[stage.status];
  return (
    <li className="rounded-3xl border border-neutral-900 bg-neutral-950/70 p-6 shadow-sm shadow-neutral-950/30">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">
              Этап {stage.number}. {stage.title}
            </h2>
            <p className="mt-2 text-sm text-neutral-400">{stage.description}</p>
          </div>
        </div>
      </div>
      {stage.links.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {stage.links.map((link) => (
            <Link
              key={`${stage.number}-${link.href}`}
              href={link.href}
              className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export default function RoadmapPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-900 bg-neutral-950/80 p-8">
        <h1 className="text-2xl font-semibold text-neutral-50">Дорожная карта</h1>
        <p className="mt-3 max-w-2xl text-sm text-neutral-400">
          Прозрачный план этапов 5–15. Следим за статусом ключевых направлений и синхронизируем команды перед
          основным запуском.
        </p>
      </section>
      <ol className="space-y-4">
        {ROADMAP_STAGES.map((stage) => (
          <StageCard key={stage.number} stage={stage} />
        ))}
      </ol>
    </div>
  );
}
