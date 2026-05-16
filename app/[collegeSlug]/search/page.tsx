import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';
import { FilterBar } from '@/components/opportunity/FilterBar';

export default async function CollegeSearchPage({
  params,
}: {
  params: { collegeSlug: string };
}) {
  const supabase = createServiceClient();

  const { data: college } = await supabase
    .from('colleges')
    .select('*')
    .eq('slug', params.collegeSlug)
    .single();

  if (!college) {
    notFound();
  }

  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('college_id', college.id)
    .eq('is_published', true)
    .eq('is_expired', false)
    .order('created_at', {
      ascending: false,
    });

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          {college.name} Opportunities
        </h1>
      </div>

      <FilterBar />

      <OpportunityGrid
        opportunities={data || []}
      />
    </div>
  );
}