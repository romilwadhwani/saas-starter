export default function BillingLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-6 w-40 rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="h-5 w-20 rounded bg-muted" />
            <div className="h-8 w-16 rounded bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-4 w-full rounded bg-muted" />
              ))}
            </div>
            <div className="h-9 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
