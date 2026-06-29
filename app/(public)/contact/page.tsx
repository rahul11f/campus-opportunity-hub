export default function ContactPage() {
  return (
    <section className="container py-16 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>

      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        Have questions, found incorrect information on a listing, or looking for partnership inquiries? We are here to help. Reach out to us using the details below.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Email Support</h2>
          <p className="text-sm text-muted-foreground mb-4">For all general inquiries, account support, and reporting issues.</p>
          <a
            href="mailto:campusopportunityhub@gmail.com"
            className="text-primary font-medium hover:underline break-all"
          >
            campusopportunityhub@gmail.com
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Phone Support</h2>
          <p className="text-sm text-muted-foreground mb-4">For urgent grievances or immediate assistance.</p>
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
