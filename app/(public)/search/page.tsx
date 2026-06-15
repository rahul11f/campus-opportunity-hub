import { createServiceClient } from '@/lib/supabase/server';
import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';
import { SearchFilters } from '@/components/opportunity/SearchFilters';
import { Suspense } from 'react';
import { SearchInput } from '@/components/opportunity/SearchInput';
import { OpportunityCardSkeleton } from '@/components/opportunity/OpportunityCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { AdSlot } from '@/components/shared/AdSlot';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['placement','internship','hackathon','scholarship','campus_drive','fellowship','competition','other'];
const VALID_SORTS = ['latest','deadline','featured'];

async function getResults(searchParams: Record<string, string | undefined>) {
  const supabase = createServiceClient();
  const q      = searchParams.q?.slice(0, 80) || '';
  const type   = VALID_TYPES.includes(searchParams.type || '') ? searchParams.type! : '';
  const sort   = VALID_SORTS.includes(searchParams.sort || '') ? searchParams.sort! : 'latest';
  const page   = Math.max(1, parseInt(searchParams.page || '1', 10));
  const limit  = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('opportunities')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .eq('is_expired', false);

  if (q) query = query.or(`role.ilike.%${q}%,company.ilike.%${q}%,location.ilike.%${q}%`);
  if (type) query = query.eq('type', type);

  if (sort === 'deadline') {
    query = query.order('deadline', { ascending: true, nullsFirst: false });
  } else if (sort === 'featured') {
    query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, count } = await query.range(offset, offset + limit - 1);
  return { data: data || [], total: count || 0, page, limit };
}

function ResultSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <OpportunityCardSkeleton key={i} />)}
    </div>
  );
}

interface SearchPageProps {
  searchParams: { q?: string; type?: string; sort?: string; page?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { data, total, page, limit } = await getResults(searchParams as Record<string, string | undefined>);
  const totalPages = Math.ceil(total / limit);
  const q = searchParams.q || '';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {q ? `Results for "${q}"` : 'All Opportunities'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {total.toLocaleString()} {total === 1 ? 'opportunity' : 'opportunities'} found
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-4">
            <SearchFilters current={searchParams as Record<string, string>} />
            <AdSlot slot="search-sidebar-1" className="mt-6 min-h-[250px]" />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Search bar + mobile filter */}
          <div className="flex gap-3">
            <SearchInput defaultValue={q} />
          </div>

          {data.length === 0 ? (
            <div className="rounded-xl border bg-card p-16 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <Suspense fallback={<ResultSkeleton />}>
              <OpportunityGrid opportunities={data} showAds={page === 1} />
            </Suspense>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                const params = new URLSearchParams();
                if (q)   params.set('q', q);
                if (searchParams.type) params.set('type', searchParams.type);
                if (searchParams.sort) params.set('sort', searchParams.sort);
                params.set('page', String(p));

                return (
                  <a
                    key={p}
                    href={`/search?${params}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-primary text-primary-foreground'
                        : 'border hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    {p}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}