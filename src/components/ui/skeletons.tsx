'use client';

export function ProductGridSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div>
          <div className="h-5 w-48 bg-muted rounded animate-shimmer" />
          <div className="h-3 w-32 bg-muted rounded mt-2 animate-shimmer" />
        </div>
        <div className="h-9 w-24 bg-muted rounded-lg animate-shimmer" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border rounded-xl overflow-hidden">
            <div className="h-64 bg-muted animate-shimmer" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-16 bg-muted rounded animate-shimmer" />
              <div className="h-4 w-full bg-muted rounded animate-shimmer" />
              <div className="flex gap-2 mt-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-7 w-10 bg-muted rounded animate-shimmer" />
                ))}
              </div>
              <div className="h-5 w-24 bg-muted rounded animate-shimmer mt-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ChartSkeleton() {
  return (
    <div className="border border-border rounded-xl p-6 bg-card">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/40">
        <div>
          <div className="h-5 w-52 bg-muted rounded animate-shimmer" />
          <div className="h-3 w-72 bg-muted rounded mt-2 animate-shimmer" />
        </div>
        <div className="h-8 w-40 bg-muted rounded-lg animate-shimmer" />
      </div>
      <div className="h-80 w-full bg-muted rounded-lg animate-shimmer" />
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-border p-6 rounded-xl bg-card">
          <div className="h-3 w-24 bg-muted rounded animate-shimmer mb-2" />
          <div className="h-7 w-32 bg-muted rounded animate-shimmer" />
          <div className="h-3 w-20 bg-muted rounded animate-shimmer mt-4" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="h-4 w-48 bg-muted rounded animate-shimmer" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/50">
          <div className="h-4 w-full bg-muted rounded animate-shimmer" />
        </div>
      ))}
    </div>
  );
}
