type FeatureComingSoonProps = {
  title: string;
  description?: string;
};

export function FeatureComingSoon({ title, description }: FeatureComingSoonProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/60 p-8 text-center text-neutral-400">
      <p className="text-base font-medium text-neutral-200">Функция «{title}» скоро появится</p>
      {description ? <p className="max-w-2xl text-sm text-neutral-500">{description}</p> : null}
    </div>
  );
}

