export default function TeamLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
          <div className="h-9 w-32 rounded bg-muted" />
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded border border-border px-4 py-3">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
              <div className="ml-auto h-6 w-16 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
