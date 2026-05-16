import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';

export default async function CollegePage({
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

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('college_id', college.id)
    .eq('is_published', true)
    .eq('is_expired', false)
    .order('featured', {
      ascending: false,
    })
    .order('created_at', {
      ascending: false,
    })
    .limit(12);

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          {college.name}
        </h1>

        <p className="text-muted-foreground mt-2">
          College-specific opportunities and notices
        </p>
      </div>

      <OpportunityGrid
        opportunities={opportunities || []}
      />
    </div>
  );
}