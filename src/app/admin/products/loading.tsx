export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="mt-2 h-4 w-72 rounded bg-muted" />
      </div>

      <div className="rounded-lg border min-h-[400px] p-6">
        <div className="space-y-4">
          <div className="h-6 w-1/4 rounded bg-muted" />
          <div className="h-6 w-1/3 rounded bg-muted" />
          <div className="h-6 w-1/2 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
