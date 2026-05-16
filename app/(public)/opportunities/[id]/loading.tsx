export default function Loading() {
  return (
    <div className="container py-10 max-w-5xl animate-pulse">
      <div className="space-y-6">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-64 bg-card rounded-2xl border" />
        <div className="h-40 bg-card rounded-2xl border" />
      </div>
    </div>
  );
}