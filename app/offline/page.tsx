export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="rounded-3xl border bg-card p-10 text-center">
        <h1 className="text-4xl font-bold">
          You are offline
        </h1>

        <p className="mt-4 text-muted-foreground">
          Reconnect to continue browsing opportunities.
        </p>
      </div>
    </div>
  );
}