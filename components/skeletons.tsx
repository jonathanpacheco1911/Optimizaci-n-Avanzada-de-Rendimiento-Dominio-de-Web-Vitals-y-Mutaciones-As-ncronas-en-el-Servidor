export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="aspect-[4/3] animate-pulse bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-9 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrdersSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4" aria-busy="true">
      <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-11 animate-pulse rounded-lg bg-slate-200" />
    </div>
  );
}
