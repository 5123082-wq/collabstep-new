export default function ProjectLoading() {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <div className="hidden w-72 border-r border-neutral-900 bg-neutral-950/60 p-6 lg:block">
        <div className="h-6 w-32 animate-pulse rounded bg-neutral-800" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-4 w-full animate-pulse rounded bg-neutral-900/70" />
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="border-b border-neutral-900 bg-neutral-950/60 px-6 py-4">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-800" />
          <div className="mt-3 h-4 w-56 animate-pulse rounded bg-neutral-900/70" />
        </div>
        <div className="space-y-6 px-6 py-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 w-full animate-pulse rounded-2xl border border-neutral-900 bg-neutral-900/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
