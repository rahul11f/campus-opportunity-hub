export default function PrivacyPage() {
  return (
    <section className="container py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>

      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Campus Opportunity Hub respects user privacy and collects only necessary
          information required to operate the platform.
        </p>

        <p>
          Authentication data is handled securely through Supabase Authentication.
        </p>

        <p>
          We do not sell user data to third parties.
        </p>

        <p>
          Public opportunity information is aggregated from notices and publicly shared sources.
        </p>
      </div>
    </section>
  );
}

