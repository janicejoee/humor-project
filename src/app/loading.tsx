export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground"
          aria-hidden
        />
        <p className="text-sm text-muted">Loading…</p>
      </div>
    </div>
  );
}
