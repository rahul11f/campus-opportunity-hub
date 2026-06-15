import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';
import {
  Trophy,
  Users,
  Briefcase,
  Clock3,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Target,
  ArrowRight,
  Zap,
  GraduationCap,
  Star,
  Building2,
  ChevronRight,
} from 'lucide-react';

export const revalidate = 60;

async function getData() {
  const supabase = createServiceClient();
  const [featured, latest, urgent, leaders, studentsRes, totalOps] = await Promise.all([
    supabase.from('opportunities').select('*').eq('is_published', true).eq('featured', true).eq('is_expired', false).limit(6),
    supabase.from('opportunities').select('*').eq('is_published', true).eq('is_expired', false).order('created_at', { ascending: false }).limit(9),
    supabase.from('opportunities').select('*').eq('is_published', true).eq('is_expired', false).not('deadline', 'is', null).order('deadline', { ascending: true }).limit(4),
    supabase.from('student_points').select('*').order('total_points', { ascending: false }).limit(3),
    supabase.from('student_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('is_published', true).eq('is_expired', false),
  ]);

  return {
    featured:  featured.data  || [],
    latest:    latest.data    || [],
    urgent:    urgent.data    || [],
    leaders:   leaders.data   || [],
    students:  studentsRes.count || 0,
    totalOps:  totalOps.count || 0,
  };
}

const CATEGORIES = [
  { label: 'Placements',    type: 'placement',    icon: '🏢' },
  { label: 'Internships',   type: 'internship',   icon: '💼' },
  { label: 'Hackathons',    type: 'hackathon',    icon: '⚡' },
  { label: 'Scholarships',  type: 'scholarship',  icon: '🎓' },
  { label: 'Fellowships',   type: 'fellowship',   icon: '🌟' },
  { label: 'Competitions',  type: 'competition',  icon: '🏆' },
];

const FEATURES = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Verified by Community',
    text: 'Every notice reviewed by admins before publishing. Zero fake listings.',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'AI Eligibility Check',
    text: 'Paste your profile once. Know instantly if you qualify for any job.',
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: 'Earn While You Help',
    text: 'Submit valid notices, earn points, climb the leaderboard.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Real-time Updates',
    text: 'New opportunities posted instantly. Never miss a deadline.',
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: 'All Branches Welcome',
    text: 'Filtered by branch, batch, CGPA. Find what you actually qualify for.',
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: 'Top Companies',
    text: 'Google, Amazon, TCS, Infosys and 100+ companies from your campus.',
  },
];

export default async function HomePage() {
  const data = await getData();

  return (
    <div className="space-y-24 pb-24 selection:bg-primary selection:text-primary-foreground">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-border/40">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/50 backdrop-blur-sm text-sm font-medium mb-8 hover:bg-muted/50 transition-colors cursor-pointer shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Now tracking <span className="text-foreground font-semibold">{data.totalOps}</span> opportunities</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground mb-6 max-w-4xl mx-auto">
            Find Opportunities{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
              Before Everyone Else.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed font-medium">
            The definitive platform for campus placements, internships, and hackathons. 
            Sourced from the community, verified by admins, built for serious students.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/search"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_14px_rgba(255,255,255,0.1)] text-sm"
            >
              Start Exploring
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/contribute"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-border bg-background hover:bg-muted font-medium transition-all text-sm shadow-sm"
            >
              Post an Opportunity
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap pt-8 border-t border-border/50">
            <StatPill value={data.students} label="Active Students" />
            <StatPill value={data.totalOps} label="Live Opportunities" />
            <StatPill value={data.featured.length} label="Featured Jobs" />
          </div>
        </div>
      </section>

      {/* ── Category Quick Filters ── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Explore Categories</h2>
            <p className="text-muted-foreground text-sm">Find exactly what you're looking for</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/search?type=${cat.type}`}
              className="group relative overflow-hidden flex flex-col items-center gap-3 p-6 rounded-2xl border bg-card hover:border-primary/50 transition-all duration-300"
            >
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{cat.icon}</span>
              <span className="text-sm font-medium text-foreground">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured ── */}
      {data.featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border bg-background flex items-center justify-center shadow-sm">
                <Star className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Picks</h2>
                <p className="text-sm text-muted-foreground">Premium opportunities hand-picked for you</p>
              </div>
            </div>
          </div>
          <OpportunityGrid opportunities={data.featured} showAds={false} />
        </section>
      )}

      {/* ── Closing Soon ── */}
      {data.urgent.length > 0 && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border bg-background flex items-center justify-center shadow-sm">
                <Clock3 className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Closing Soon</h2>
                <p className="text-sm text-muted-foreground">Don't miss these deadlines</p>
              </div>
            </div>
          </div>
          <OpportunityGrid opportunities={data.urgent} showAds={false} />
        </section>
      )}

      {/* ── Latest ── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border bg-background flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Latest Additions</h2>
              <p className="text-sm text-muted-foreground">Fresh opportunities from the campus network</p>
            </div>
          </div>
          <Link
            href="/search"
            className="hidden sm:flex items-center gap-1 px-4 py-2 rounded-full border bg-background text-sm font-medium hover:bg-muted transition-colors"
          >
            View Directory <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <OpportunityGrid opportunities={data.latest} showAds={true} />
        
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/search"
            className="flex items-center gap-1 px-6 py-3 rounded-full border bg-background text-sm font-medium hover:bg-muted transition-colors"
          >
            View All Opportunities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Why Campus Hub ── */}
      <section className="max-w-7xl mx-auto px-6 pt-12">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Why Campus Hub?</h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Built by students, for students. A smarter, cleaner way to discover and track career opportunities.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="group p-8 rounded-3xl border bg-card hover:bg-accent/50 transition-colors duration-300">
              <div className="w-10 h-10 rounded-lg border bg-background flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg tracking-tight">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden border bg-card p-12 text-center md:p-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 text-foreground">
              Ready to land your dream role?
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg">
              Join thousands of students leveraging Campus Hub to stay ahead of the competition.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-all text-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_14px_rgba(255,255,255,0.1)]"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-bold tracking-tight text-foreground text-3xl">{value.toLocaleString()}+</span>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
