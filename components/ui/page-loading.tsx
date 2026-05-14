type PageLoadingProps = {
  title?: string;
  rows?: number;
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-cyan-100/60 ${className}`} />;
}

export function PageLoading({
  title = "Loading",
  rows = 4
}: PageLoadingProps) {
  return (
    <div className="space-y-7">
      <section>
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="mt-3 h-9 w-56" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="app-card p-5">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-4 h-8 w-12" />
        </div>
        <div className="app-card p-5">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-4 h-8 w-12" />
        </div>
        <div className="app-card p-5">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-4 h-8 w-12" />
        </div>
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, index) => (
            <div className="grid gap-4 px-6 py-5 md:grid-cols-4" key={index}>
              <SkeletonBlock className="h-5 w-36" />
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-5 w-20 justify-self-start md:justify-self-end" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
