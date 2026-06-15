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
  { label: 'Placements',    type: 'placement',    icon: '🏢', color: 'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400'   },
  { label: 'Internships',   type: 'internship',   icon: '💼', color: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400' },
  { label: 'Hackathons',    type: 'hackathon',    icon: '⚡', color: 'from-violet-600/20 to-violet-600/5 border-violet-500/30 text-violet-400'  },
  { label: 'Scholarships',  type: 'scholarship',  icon: '🎓', color: 'from-amber-600/20 to-amber-600/5 border-amber-500/30 text-amber-400'    },
  { label: 'Fellowships',   type: 'fellowship',   icon: '🌟', color: 'from-orange-600/20 to-orange-600/5 border-orange-500/30 text-orange-400'  },
  { label: 'Competitions',  type: 'competition',  icon: '🏆', color: 'from-rose-600/20 to-rose-600/5 border-rose-500/30 text-rose-400'       },
];

const FEATURES = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Verified by Community',
    text: 'Every notice reviewed by admins before publishing. Zero fake listings.',
    color: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI Eligibility Check',
    text: 'Paste your profile once. Know instantly if you qualify for any job.',
    color: 'text-blue-400 bg-blue-400/10',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Earn While You Help',
    text: 'Submit valid notices, earn points, climb the leaderboard.',
    color: 'text-amber-400 bg-amber-400/10',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Real-time Updates',
    text: 'New opportunities posted instantly. Never miss a deadline.',
    color: 'text-violet-400 bg-violet-400/10',
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'All Branches Welcome',
    text: 'Filtered by branch, batch, CGPA. Find what you actually qualify for.',
    color: 'text-cyan-400 bg-cyan-400/10',
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Top Companies',
    text: 'Google, Amazon, TCS, Infosys and 100+ companies from your campus.',
    color: 'text-pink-400 bg-pink-400/10',
  },
];

export default async function HomePage() {
  const data = await getData();

  return (
    <div className="space-y-24 pb-20">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-emerald-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Student-Powered Career Intelligence Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-foreground mb-6">
            Find Opportunities{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400">
              Before Everyone Else
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
            Placements, internships, hackathons, scholarships, academic notices — sourced from WhatsApp, Telegram, PDFs 
            and verified by campus admins. Built for serious students.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-12">
            <Link
              href="/search"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25 text-base"
            >
              Browse Opportunities
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent font-semibold text-base transition-all"
            >
              Student Login
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
            <StatPill icon={<Users className="w-4 h-4" />} value={data.students} label="Students" />
            <StatPill icon={<Briefcase className="w-4 h-4" />} value={data.totalOps} label="Live Opportunities" />
            <StatPill icon={<Trophy className="w-4 h-4" />} value={data.leaders.length} label="Top Contributors" />
            <StatPill icon={<Star className="w-4 h-4" />} value={data.featured.length} label="Featured Jobs" />
          </div>
        </div>
      </section>

      {/* ── Category Quick Filters ── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Browse by Category</h2>
          <Link href="/search" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/search?type=${cat.type}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border bg-gradient-to-br ${cat.color} hover:scale-105 transition-all duration-200 text-center`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-semibold">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured ── */}
      {data.featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Featured Opportunities</h2>
              <p className="text-sm text-muted-foreground">Hand-picked by our team</p>
            </div>
          </div>
          <OpportunityGrid opportunities={data.featured} showAds={false} />
        </section>
      )}

      {/* ── Closing Soon ── */}
      {data.urgent.length > 0 && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">⚡ Closing Soon</h2>
              <p className="text-sm text-muted-foreground">Apply before the deadline</p>
            </div>
          </div>
          <OpportunityGrid opportunities={data.urgent} showAds={false} />
        </section>
      )}

      {/* ── Latest ── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Latest Opportunities</h2>
              <p className="text-sm text-muted-foreground">Just added to the platform</p>
            </div>
          </div>
          <Link
            href="/search"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <OpportunityGrid opportunities={data.latest} showAds={true} />
      </section>

      {/* ── Why Campus Hub ── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Why Campus Opportunity Hub?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built by students, for students. The smartest way to discover and track campus opportunities.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-emerald-600/10 p-12 text-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-[80px]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don&apos;t miss your next opportunity
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of students already using Campus Hub to find placements, internships and more.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Join for Free
            </Link>
            <Link
              href="/dashboard/contribute"
              className="px-8 py-4 rounded-xl border border-border hover:bg-accent font-semibold transition-all"
            >
              Contribute a Notice
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="font-bold text-foreground text-lg">{value.toLocaleString()}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
