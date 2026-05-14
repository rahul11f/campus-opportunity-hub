export default function ContactPage() {
  return (
    <section className="container py-16 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>

      <p className="mt-4 text-muted-foreground leading-relaxed">
        For support, listing issues, corrections, or partnership inquiries.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Email</p>
        <a
          href="mailto:hello@campusopportunityhub.in"
          className="text-primary font-medium"
        >
          hello@campusopportunityhub.in
        </a>
      </div>
    </section>
  );
}

