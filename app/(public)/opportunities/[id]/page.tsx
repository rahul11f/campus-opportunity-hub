import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import {
  ExternalLink,
  MapPin,
  IndianRupee,
  ArrowLeft,
  Building2,
  Briefcase,
} from 'lucide-react';
import { StudentOpportunityActions } from '@/components/auth/StudentOpportunityActions';

export default async function OpportunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!data) {
    notFound();
  }

  return (
    <div className="container py-10 max-w-5xl">
      <div className="space-y-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <span className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                {data.type}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold mt-4">
                {data.role}
              </h1>

              <div className="flex items-center gap-2 mt-3 text-lg text-muted-foreground">
                <Building2 className="w-5 h-5" />
                {data.company}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {data.location && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-sm">
                  <MapPin className="w-4 h-4" />
                  {data.location}
                </div>
              )}

              {data.salary && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-sm">
                  <IndianRupee className="w-4 h-4" />
                  {data.salary}
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-sm">
                <Briefcase className="w-4 h-4" />
                Opportunity
              </div>
            </div>

            <StudentOpportunityActions
              opportunityId={data.id}
              applyLink={data.apply_link}
            />

            {data.apply_link && (
              <a
                href={data.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Official Application Link
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {data.skills?.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Required Skills
            </h2>

            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-2 rounded-full bg-secondary text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.instructions && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Application Instructions
            </h2>

            <p className="text-muted-foreground leading-7 whitespace-pre-line">
              {data.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
