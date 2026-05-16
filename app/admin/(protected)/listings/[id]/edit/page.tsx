import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { OpportunityForm } from '@/components/admin/OpportunityForm';
import { EligibilityUploader } from '@/components/admin/EligibilityUploader';
import { Opportunity } from '@/types/opportunity';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Edit Listing | Admin',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!data) {
    notFound();
  }

  const opp = data as Opportunity;

  const initialData = {
    company: opp.company,
    role: opp.role,
    type: opp.type,
    salary: opp.salary,
    location: opp.location,
    eligibility: opp.eligibility,
    skills: opp.skills,
    responsibilities: opp.responsibilities,
    interview_process: opp.interview_process,
    instructions: opp.instructions,
    apply_link: opp.apply_link,
    deadline: opp.deadline,
    tags: opp.tags,
    confidence_score: 1,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </Link>

      <div>
        <h1 className="text-2xl font-bold">
          Edit Listing
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          {opp.role} at {opp.company}
        </p>
      </div>

      <OpportunityForm
        initialData={initialData}
        rawText={opp.raw_text || ''}
        sourceLink={opp.source_link}
        existingId={opp.id}
      />

      <EligibilityUploader
        opportunityId={opp.id}
        collegeId={opp.college_id || undefined}
      />
    </div>
  );
}
