import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';
import { FilterBar } from '@/components/opportunity/FilterBar';
import { Opportunity } from '@/types/opportunity';

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    sort?: string;
    page?: string;
  };
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const supabase = createServiceClient();

  const q = searchParams.q?.trim() || '';
  const type = searchParams.type || '';
  const sort = searchParams.sort || 'latest';
  const page = parseInt(searchParams.page || '1');
  const limit = 18;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('opportunities')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .eq('is_expired', false);

  if (q) {
    query = query.or(
      `company.ilike.%${q}%,role.ilike.%${q}%,location.ilike.%${q}%`
    );
  }

  if (type) {
    query = query.eq('type', type);
  }

  if (sort === 'deadline') {
    query = query.order('deadline', {
      ascending: true,
      nullsFirst: false,
    });
  } else if (sort === 'featured') {
    query = query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', {
      ascending: false,
    });
  }

  const { data, count } = await query.range(
    offset,
    offset + limit - 1
  );

  const totalPages = Math.ceil((count || 0) / limit);

  const makeUrl = (p: number) => {
    const params = new URLSearchParams();

    if (q) params.set('q', q);
    if (type) params.set('type', type);
    if (sort) params.set('sort', sort);

    params.set('page', String(p));

    return `/search?${params.toString()}`;
  };

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Search Opportunities
        </h1>

        <p className="text-muted-foreground mt-2">
          Explore placements, internships, scholarships,
          hackathons, and upcoming opportunities.
        </p>
      </div>

      <FilterBar />

      <p className="text-sm text-muted-foreground">
        {count || 0} opportunities found
      </p>

      <OpportunityGrid
        opportunities={(data as Opportunity[]) || []}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-3">
          {page > 1 && (
            <Link
              href={makeUrl(page - 1)}
              className="px-4 py-2 border rounded-lg"
            >
              Previous
            </Link>
          )}

          <span className="px-4 py-2 text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={makeUrl(page + 1)}
              className="px-4 py-2 border rounded-lg"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
