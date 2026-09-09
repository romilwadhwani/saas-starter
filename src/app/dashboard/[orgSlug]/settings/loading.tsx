export default function SettingsLoading() {
  return (
    <div className="max-w-2xl space-y-6 p-6 animate-pulse">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="h-5 w-20 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
        <div className="h-9 w-28 rounded bg-muted" />
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="h-5 w-28 rounded bg-muted" />
        <div className="h-4 w-80 rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
        <div className="h-9 w-40 rounded bg-muted" />
      </div>
    </div>
  );
}
