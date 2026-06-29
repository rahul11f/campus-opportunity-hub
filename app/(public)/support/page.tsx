export default function SupportPage() {
  return (
    <section className="container py-16 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Support</h1>

      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        Need help with your account, found incorrect information on a listing, or experiencing technical issues? We are here to help.
      </p>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Email Support</h2>
          <p className="text-muted-foreground mb-4">Drop us an email and we'll get back to you within 24 hours.</p>
          <a
            href="mailto:campusopportunityhub@gmail.com"
            className="text-primary font-medium hover:underline break-all"
          >
            campusopportunityhub@gmail.com
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Phone Support</h2>
          <p className="text-muted-foreground mb-4">For immediate assistance or urgent account issues.</p>
          <a
            href="tel:+918434856473"
            className="text-primary font-medium hover:underline"
          >
            +91 8434856473
          </a>
        </div>
      </div>
    </section>
  );
}
