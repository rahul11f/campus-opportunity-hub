import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Search, Zap, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { OpportunityCard, OpportunityCardSkeleton } from '@/components/opportunity/OpportunityCard';
import { FilterBar } from '@/components/opportunity/FilterBar';
import { AdSlot } from '@/components/ads/AdSlot';
import { Opportunity } from '@/types/opportunity';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Campus Opportunity Hub - Placements, Internships & More',
  description: 'Discover the latest campus placements, internships, hackathons, and scholarships. AI-powered, student-first opportunity discovery platform.',
};

async function getStats() {
  const supabase = createClient();
  const { count } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .eq('is_expired', false);
  return { total: count || 0 };
}

async function getOpportunities(searchParams: Record<string, string>) {
  const supabase = createClient();
  const type = searchParams.type || '';
  const sort = searchParams.sort || 'latest';
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('opportunities')
    .select('*')
    .eq('is_published', true)
    .eq('is_expired', false);

  if (type) query = query.eq('type', type);

  if (sort === 'deadline') {
    query = query.order('deadline', { ascending: true, nullsFirst: false });
  } else if (sort === 'featured') {
    query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, count } = await query.range(offset, offset + limit - 1);
  return { opportunities: (data as Opportunity[]) || [], total: count || 0, page, limit };
}

async function getFeatured() {
  const supabase = createClient();
  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('is_published', true)
    .eq('is_expired', false)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return (data as Opportunity[]) || [];
}

function SearchBar() {
  return (
    <form action="/search" method="GET" className="relative max-w-2xl mx-auto">
      <div className="flex items-center gap-2 p-2 bg-background border-2 border-border rounded-2xl shadow-lg hover:border-primary/50 focus-within:border-primary transition-colors">
        <Search className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
        <input
          type="text"
          name="q"
          placeholder="Search companies, roles, skills..."
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm py-1.5"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          Search
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

function FeaturedStrip({ opportunities }: { opportunities: Opportunity[] }) {
  if (opportunities.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Featured Opportunities
        </h2>
        <Link href="/?sort=featured" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-thin">
        {opportunities.map((opp) => (
          <div key={opp.id} className="flex-shrink-0 w-72 snap-start">
            <OpportunityCard opportunity={opp} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Pagination({
  page,
  total,
  limit,
  searchParams,
}: {
  page: number;
  total: number;
  limit: number;
  searchParams: Record<string, string>;
}) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const makeUrl = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    return `/?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {page > 1 && (
        <Link
          href={makeUrl(page - 1)}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
        >
          Previous
        </Link>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={makeUrl(page + 1)}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const [stats, { opportunities, total, page, limit }, featured] = await Promise.all([
    getStats(),
    getOpportunities(searchParams),
    getFeatured(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3 h-3" />
              AI-Powered Campus Opportunities
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-4">
              Your Campus,{' '}
              <span className="text-primary">Your Opportunities</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
  Discover placements, internships, hackathons, and scholarships -
  curated from campus notices and structured by AI, so you never miss an opportunity.
</p>
            <SearchBar />
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-8">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-foreground">{stats.total}</span> active opportunities
            </span>
           <span>•</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Updated daily
            </span>
          </div>
        </div>
      </section>

      {/* Banner Ad */}
      <div className="container mb-6">
        <AdSlot position="banner" />
      </div>

      <div className="container pb-16">
        {/* Featured strip */}
        <FeaturedStrip opportunities={featured} />

        {/* Filters */}
        <Suspense>
          <FilterBar />
        </Suspense>

        {/* Result count */}
        <p className="text-sm text-muted-foreground mt-4 mb-6">
          {total > 0 ? (
            <>Showing <span className="font-medium text-foreground">{opportunities.length}</span> of <span className="font-medium text-foreground">{total}</span> opportunities</>
          ) : (
            'No opportunities found. Try different filters.'
          )}
        </p>

        {/* Grid */}
        {opportunities.length === 0 ? (
          <div className="text-center py-16">
           <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No opportunities yet</h3>
            <p className="text-muted-foreground text-sm">Check back soon - we update listings daily!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((opp, i) => (
                <div key={opp.id}>
                  <OpportunityCard opportunity={opp} index={i} />
                  {/* In-feed ad every 6 cards */}
                  {(i + 1) % 6 === 0 && (
                    <div className="md:hidden mt-4">
                      <AdSlot position="in-feed" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop in-feed ad */}
            {opportunities.length >= 6 && (
              <div className="hidden md:flex justify-center mt-8">
                <AdSlot position="in-feed" />
              </div>
            )}
          </>
        )}

        <Pagination page={page} total={total} limit={limit} searchParams={searchParams} />
      </div>
    </div>
  );
}

