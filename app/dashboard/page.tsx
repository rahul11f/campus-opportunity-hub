'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Trophy,
  Clock3,
  CheckCircle2,
  XCircle,
  Bookmark,
  Briefcase,
  TrendingUp,
  Send,
  ArrowRight,
  Star,
  Zap,
  FileText,
} from 'lucide-react';

interface DashData {
  contributions: any[];
  points: any;
  saved: any[];
  applications: any[];
  rank: number | null;
  recentOpps: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = useRef(createClient());

  useEffect(() => {
    const sb = supabase.current;

    async function load() {
      const { data: { user: u } } = await sb.auth.getUser();
      if (!u) return;
      setUser(u);

      const [contribs, points, saved, applications, leaderboard, recentOpps] = await Promise.all([
        sb.from('student_contributions').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
        sb.from('student_points').select('*').eq('user_id', u.id).maybeSingle(),
        sb.from('student_saved_opportunities').select('*').eq('user_id', u.id),
        sb.from('student_applications').select('*,opportunities(role,company,type,deadline)').eq('user_id', u.id).order('updated_at', { ascending: false }).limit(5),
        sb.from('student_points').select('*').order('total_points', { ascending: false }),
        sb.from('opportunities').select('id,role,company,type,deadline,featured').eq('is_published', true).eq('is_expired', false).order('created_at', { ascending: false }).limit(6),
      ]);

      const rank = (leaderboard.data || []).findIndex((x: any) => x.user_id === u.id) + 1;

      setData({
        contributions: contribs.data || [],
        points: points.data,
        saved: saved.data || [],
        applications: applications.data || [],
        rank: rank > 0 ? rank : null,
        recentOpps: recentOpps.data || [],
      });
    }

    load();
  }, []);

  if (!data || !user) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
        <div className="grid md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const pending  = data.contributions.filter((x) => x.status === 'pending').length;
  const approved = data.contributions.filter((x) => x.status === 'approved').length;
  const rejected = data.contributions.filter((x) => x.status === 'rejected').length;
  const successRate = data.contributions.length > 0
    ? Math.round((approved / data.contributions.length) * 100) : 0;

  const displayName = user.email?.split('@')[0] || 'Student';

  return (
    <div className="p-6 space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s your activity summary and new opportunities.
          </p>
        </div>
        <Link
          href="/contribute"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" /> Contribute Notice
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Trophy className="w-5 h-5" />}   label="Points"       value={data.points?.total_points || 0} color="amber"  href="/dashboard/leaderboard" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Rank"       value={data.rank ? `#${data.rank}` : '—'} color="blue" href="/dashboard/leaderboard" />
        <StatCard icon={<Bookmark className="w-5 h-5" />} label="Saved Jobs"   value={data.saved.length}                color="violet" href="/dashboard/saved" />
        <StatCard icon={<Briefcase className="w-5 h-5" />} label="Applications" value={data.applications.length}        color="green"  href="/dashboard/applications" />
      </div>

      {/* Contribution Stats */}
      <div className="grid grid-cols-3 gap-4">
        <MiniStat icon={<Clock3 className="w-4 h-4" />}      label="Pending"  value={pending}     color="amber" />
        <MiniStat icon={<CheckCircle2 className="w-4 h-4" />} label="Approved" value={approved}    color="green" />
        <MiniStat icon={<XCircle className="w-4 h-4" />}      label="Rejected" value={rejected}    color="red"   />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Recent Applications
            </h2>
            <Link href="/dashboard/applications" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data.applications.length === 0 ? (
            <EmptyState text="No applications yet. Browse opportunities and apply!" action={{ label: 'Browse Opportunities', href: '/search' }} />
          ) : (
            <div className="space-y-2">
              {data.applications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{app.opportunities?.role || 'Opportunity'}</p>
                    <p className="text-xs text-muted-foreground">{app.opportunities?.company}</p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contributions */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> My Contributions
            </h2>
            <Link href="/dashboard/my-contributions" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data.contributions.length === 0 ? (
            <EmptyState
              text="Haven't contributed yet? Submit a notice and earn points!"
              action={{ label: 'Submit Notice', href: '/contribute' }}
            />
          ) : (
            <div className="space-y-2">
              {data.contributions.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground">{c.contribution_type}</p>
                  </div>
                  <ContribStatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Opportunities */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Fresh Opportunities
          </h2>
          <Link href="/search" className="text-xs text-primary hover:underline flex items-center gap-1">
            Browse all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.recentOpps.map((opp: any) => {
            const days = opp.deadline
              ? Math.ceil((new Date(opp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            return (
              <a
                key={opp.id}
                href={`/opportunities/${opp.id}`}
                className="block p-4 rounded-xl border hover:border-primary/30 hover:bg-accent transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-sm line-clamp-1">{opp.role}</p>
                  {opp.featured && <Star className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{opp.company}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium type-badge-${opp.type}`}>
                    {opp.type}
                  </span>
                  {days !== null && days >= 0 && (
                    <span className={`text-xs font-medium ${days <= 3 ? 'text-red-500' : days <= 7 ? 'text-amber-500' : 'text-green-500'}`}>
                      {days === 0 ? 'Today' : `${days}d left`}
                    </span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4">
        <PerfCard label="Success Rate" value={`${successRate}%`} sub="contribution approvals" />
        <PerfCard label="Points Earned" value={data.points?.total_points || 0} sub="all time" />
        <PerfCard label="Opportunities Tracked" value={data.saved.length + data.applications.length} sub="saved + applied" />
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color, href }: { icon: React.ReactNode; label: string; value: string | number; color: string; href: string }) {
  const colors: Record<string, string> = {
    amber:  'text-amber-400 bg-amber-400/10',
    blue:   'text-blue-400 bg-blue-400/10',
    violet: 'text-violet-400 bg-violet-400/10',
    green:  'text-green-400 bg-green-400/10',
  };
  return (
    <Link href={href} className="rounded-xl border bg-card p-5 hover:border-primary/30 hover:bg-accent/50 transition-all">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </Link>
  );
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    amber: 'text-amber-400', green: 'text-green-400', red: 'text-red-400',
  };
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <span className={colors[color]}>{icon}</span>
      <div>
        <p className="font-bold text-lg">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function PerfCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function EmptyState({ text, action }: { text: string; action?: { label: string; href: string } }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground mb-3">{text}</p>
      {action && (
        <Link href={action.href} className="text-xs text-primary font-medium hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    saved:       'bg-gray-500/10 text-gray-400',
    applying:    'bg-blue-500/10 text-blue-400',
    applied:     'bg-indigo-500/10 text-indigo-400',
    shortlisted: 'bg-violet-500/10 text-violet-400',
    oa:          'bg-amber-500/10 text-amber-400',
    interview:   'bg-orange-500/10 text-orange-400',
    hr:          'bg-cyan-500/10 text-cyan-400',
    offer:       'bg-green-500/10 text-green-400',
    rejected:    'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md shrink-0 ${map[status] || map.saved}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ContribStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  'bg-amber-500/10 text-amber-400',
    approved: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md shrink-0 ${map[status] || ''}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}