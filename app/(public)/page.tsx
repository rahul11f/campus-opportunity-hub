import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';
import {
  Trophy,
  Users,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

async function getData() {
  const supabase = createServiceClient();

  const [featured, latest, leaders, students] =
    await Promise.all([
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
    leaders: leaders.data || [],
    students: students.count || 0,
  };
}

export default async function HomePage() {
  const data = await getData();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-20">
      <section className="text-center py-16 space-y-8">
        <div className="inline-flex px-4 py-2 rounded-full border">
          Student Powered Opportunity Network
        </div>

        <h1 className="text-6xl md:text-7xl font-bold leading-tight">
          Discover Campus Opportunities Faster
        </h1>

        <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
          Placements, internships, academic notices, results, and student verified opportunities.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/opportunities"
            className="px-6 py-4 rounded-2xl bg-primary text-white font-semibold"
          >
            Explore Opportunities
          </Link>

          <Link
            href="/login"
            className="px-6 py-4 rounded-2xl border font-semibold"
          >
            Contribute a Notice
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Stat icon={<Users />} title="Students" value={data.students} />
        <Stat icon={<Briefcase />} title="Live Opportunities" value={data.latest.length} />
        <Stat icon={<Trophy />} title="Top Contributors" value={data.leaders.length} />
      </section>

      <section className="space-y-6">
        <h2 className="text-4xl font-bold">
          Featured Opportunities
        </h2>

        <OpportunityGrid
          opportunities={data.featured}
          showAds={false}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-4xl font-bold">
          Latest Opportunities
        </h2>

        <OpportunityGrid
          opportunities={data.latest}
          showAds={true}
        />
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Feature
          icon={<ShieldCheck />}
          title="Eligibility Tracking"
          text="Check instantly if you qualify."
        />

        <Feature
          icon={<Sparkles />}
          title="Student Verified Notices"
          text="Community-powered trusted updates."
        />

        <Feature
          icon={<Target />}
          title="Contribution Rewards"
          text="Earn points and leaderboard recognition."
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-4xl font-bold">
          Platform Roadmap
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Road title="AI Notice Extraction" />
          <Road title="Google Sheet Eligibility Import" />
          <Road title="Multi-college Scaling" />
          <Road title="Smart Eligibility Automation" />
        </div>
      </section>
    </div>
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