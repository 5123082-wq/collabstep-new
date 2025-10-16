export default function ProjectLoading() {
  return (
    <div className="bg-neutral-950 px-6 py-16 text-neutral-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="h-8 w-1/3 animate-pulse rounded bg-neutral-800" />
        <div className="space-y-3">
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-800" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-800" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-full animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
