import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';
import { FilterBar } from '@/components/opportunity/FilterBar';
import { createClient } from '@/lib/supabase/server';

interface SearchPageProps {
  searchParams: {
    type?: string;
    sort?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = createClient();

  let query = supabase
    .from('opportunities')
    .select('*')
    .eq('is_published', true)
    .eq('is_expired', false);

  if (searchParams.type) {
    query = query.eq('type', searchParams.type);
  }

  if (searchParams.sort === 'deadline') {
    query = query.order('deadline', { ascending: true });
  } else if (searchParams.sort === 'featured') {
    query = query.order('featured', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data } = await query;

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Search Opportunities</h1>
        <p className="text-muted-foreground mt-2">
          Browse placements, internships, hackathons, scholarships and more.
        </p>
      </div>

      <FilterBar />

      <OpportunityGrid opportunities={data || []} />
    </div>
  );
}
