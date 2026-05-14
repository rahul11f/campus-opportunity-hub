export default function FAQPage() {
  return (
    <section className="container py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="font-semibold">Are listings verified?</h2>
          <p className="text-muted-foreground mt-2">
            Listings are structured from notices, but users should verify with official sources.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Is this affiliated with colleges?</h2>
          <p className="text-muted-foreground mt-2">
            No, this is an independent informational platform.
          </p>
        </div>
      </div>
    </section>
  );
}

