import { createServiceClient } from '@/lib/supabase/server';
import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';

function matchEligibility(opportunity: any, branch: string) {
  if (!branch) return true;

  const branches =
    opportunity?.eligibility?.branches || [];

  if (!branches.length) return true;

  return branches.some((b: string) =>
    b.toLowerCase().includes(branch.toLowerCase())
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const supabase = createServiceClient();

  let query = supabase
    .from('opportunities')
    .select('*')
    .eq('is_published', true);

  if (searchParams.type) {
    query = query.eq('type', searchParams.type);
  }

  if (searchParams.location) {
    query = query.ilike(
      'location',
      `%${searchParams.location}%`
    );
  }

  if (searchParams.sort === 'deadline') {
    query = query.order('deadline', {
      ascending: true,
    });
  } else if (searchParams.sort === 'featured') {
    query = query.order('featured', {
      ascending: false,
    });
  } else {
    query = query.order('created_at', {
      ascending: false,
    });
  }

  const { data } = await query;

  let opportunities = data || [];

  if (searchParams.q) {
    opportunities = opportunities.filter((o) =>
      `${o.company} ${o.role} ${o.instructions}`
        .toLowerCase()
        .includes(searchParams.q.toLowerCase())
    );
  }

  if (searchParams.branch) {
    opportunities = opportunities.filter((o) =>
      matchEligibility(o, searchParams.branch)
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="text-5xl font-bold">
          Discover Opportunities
        </h1>

        <p className="text-muted-foreground mt-3">
          Search placements, internships, hackathons,
          scholarships and campus drives.
        </p>
      </div>

      <form
        className="grid md:grid-cols-6 gap-4 rounded-3xl border bg-card p-6"
      >
        <input
          name="q"
          defaultValue={searchParams.q || ''}
          placeholder="Search company / role"
          className="border rounded-2xl p-4 bg-background"
        />

        <select
          name="type"
          defaultValue={searchParams.type || ''}
          className="border rounded-2xl p-4 bg-background"
        >
          <option value="">All Types</option>
          <option value="placement">Placement</option>
          <option value="internship">Internship</option>
          <option value="hackathon">Hackathon</option>
          <option value="scholarship">Scholarship</option>
        </select>

        <input
          name="location"
          defaultValue={searchParams.location || ''}
          placeholder="Location"
          className="border rounded-2xl p-4 bg-background"
        />

        <input
          name="branch"
          defaultValue={searchParams.branch || ''}
          placeholder="Branch"
          className="border rounded-2xl p-4 bg-background"
        />

        <select
          name="sort"
          defaultValue={searchParams.sort || 'latest'}
          className="border rounded-2xl p-4 bg-background"
        >
          <option value="latest">Latest</option>
          <option value="deadline">Deadline</option>
          <option value="featured">Featured</option>
        </select>

        <button
          className="rounded-2xl bg-primary text-white font-semibold"
        >
          Search
        </button>
      </form>

      <OpportunityGrid
        opportunities={opportunities}
        showAds={true}
      />
    </div>
  );
}