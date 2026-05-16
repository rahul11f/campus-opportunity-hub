import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';
import {
  Trophy,
  Users,
  Briefcase,
  Search,
  Clock3,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

async function getData() {
  const supabase = createServiceClient();

  const [
    featured,
    latest,
    urgent,
    leaders,
    students,
  ] = await Promise.all([
    supabase
      .from('opportunities')
      .select('*')
      .eq('is_published', true)
      .eq('featured', true)
      .limit(6),

    supabase
      .from('opportunities')
      .select('*')
      .eq('is_published', true)
      .order('created_at', {
        ascending: false,
      })
      .limit(9),

    supabase
      .from('opportunities')
      .select('*')
      .eq('is_published', true)
      .not('deadline', 'is', null)
      .order('deadline', {
        ascending: true,
      })
      .limit(4),

    supabase
      .from('student_points')
      .select('*')
      .order('total_points', {
        ascending: false,
      })
      .limit(3),

    supabase
      .from('student_profiles')
      .select('*', {
        count: 'exact',
        head: true,
      }),
  ]);

  return {
    featured: featured.data || [],
    latest: latest.data || [],
    urgent: urgent.data || [],
    leaders: leaders.data || [],
    students: students.count || 0,
  };
}

export default async function HomePage() {
  const data = await getData();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-20">
      <section className="text-center py-14 space-y-8">
        <div className="inline-flex px-4 py-2 rounded-full border">
          Student Powered Career Platform
        </div>

        <h1 className="text-6xl md:text-7xl font-bold leading-tight">
          Find Opportunities Before Everyone Else
        </h1>

        <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
          Placements, internships, hackathons, scholarships,
          academic notices, and verified student submissions.
        </p>

        <div className="max-w-3xl mx-auto border rounded-3xl px-6 py-5 flex items-center gap-4 bg-card">
          <Search className="w-5 h-5" />
          <input
            placeholder="Search jobs, internships, companies..."
            className="bg-transparent outline-none flex-1"
            disabled
          />
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          <Quick href="/search?type=placement">Placements</Quick>
          <Quick href="/search?type=internship">Internships</Quick>
          <Quick href="/search?type=hackathon">Hackathons</Quick>
          <Quick href="/search?type=scholarship">Scholarships</Quick>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Stat icon={<Users />} title="Students" value={data.students} />
        <Stat icon={<Briefcase />} title="Live Opportunities" value={data.latest.length} />
        <Stat icon={<Trophy />} title="Top Contributors" value={data.leaders.length} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp />
          <h2 className="text-4xl font-bold">
            Featured Opportunities
          </h2>
        </div>

        <OpportunityGrid
          opportunities={data.featured}
          showAds={false}
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock3 />
          <h2 className="text-4xl font-bold">
            Closing Soon
          </h2>
        </div>

        <OpportunityGrid
          opportunities={data.urgent}
          showAds={false}
        />
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-bold">
            Latest Opportunities
          </h2>

          <Link
            href="/opportunities"
            className="text-primary font-semibold"
          >
            View All →
          </Link>
        </div>

        <OpportunityGrid
          opportunities={data.latest}
          showAds={true}
        />
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Feature
          icon={<ShieldCheck />}
          title="Verified Student Contributions"
          text="Community sourced notices approved by admins."
        />

        <Feature
          icon={<Sparkles />}
          title="Eligibility Intelligence"
          text="Check if you qualify instantly."
        />

        <Feature
          icon={<Target />}
          title="Rewards + Leaderboard"
          text="Earn points by helping students."
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-4xl font-bold">
          Product Roadmap
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Road title="AI Notice Parsing" />
          <Road title="Google Sheet Eligibility Sync" />
          <Road title="Realtime Notifications" />
          <Road title="Multi-college expansion" />
        </div>
      </section>
    </div>
  );
}

function Quick({
  href,
  children,
}: any) {
  return (
    <Link
      href={href}
      className="px-5 py-3 rounded-full border hover:border-primary"
    >
      {children}
    </Link>
  );
}

function Stat({ icon, title, value }: any) {
  return (
    <div className="rounded-3xl border bg-card p-8">
      <div className="mb-4">{icon}</div>
      <p>{title}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
}

function Feature({ icon, title, text }: any) {
  return (
    <div className="rounded-3xl border bg-card p-8">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground mt-3">{text}</p>
    </div>
  );
}

function Road({ title }: any) {
  return (
    <div className="rounded-3xl border bg-card p-6 font-semibold">
      {title}
    </div>
  );
}