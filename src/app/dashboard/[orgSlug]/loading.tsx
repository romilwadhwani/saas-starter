export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-4 h-8 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="mt-6 h-[300px] rounded bg-muted" />
      </div>
    </div>
  );
}
