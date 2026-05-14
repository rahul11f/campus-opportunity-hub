import { GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <section className="container py-16 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          About Campus Opportunity Hub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Campus Opportunity Hub transforms messy campus placement and opportunity notices
          into structured, searchable listings for students.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <GraduationCap className="w-8 h-8 text-primary mb-4" />
          <h2 className="font-semibold text-lg">Built for Students</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Designed to simplify placements, internships, hackathons, scholarships,
            and campus opportunities.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <Sparkles className="w-8 h-8 text-primary mb-4" />
          <h2 className="font-semibold text-lg">AI Powered</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            AI helps structure unorganized notices into clean and searchable information.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <ShieldCheck className="w-8 h-8 text-primary mb-4" />
          <h2 className="font-semibold text-lg">Transparency First</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Always verify final details from official company or institution sources.
          </p>
        </div>
      </div>
    </section>
  );
}

