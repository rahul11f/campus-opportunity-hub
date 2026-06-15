'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Users,
  Trophy,
  Clock3,
  CheckCircle2,
  XCircle,
  Briefcase,
  TrendingUp,
  Activity,
  Zap,
  Eye,
  PlusCircle,
  List,
  MessageSquare,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import { AdminControlCenter } from '@/components/admin/AdminControlCenter';

interface DashboardData {
  pending: number;
  approved: number;
  rejected: number;
  students: number;
  listings: number;
  liveListings: number;
  draftListings: number;
  expiredListings: number;
  totalViews: number;
  topScore: number;
  leaderboard: any[];
  recent: any[];
}

async function loadData(supabase: ReturnType<typeof createClient>): Promise<DashboardData> {
  const [
    pendingRes,
    approvedRes,
    rejectedRes,
    studentsRes,
    listingsRes,
    liveRes,
    draftRes,
    expiredRes,
    viewsRes,
    topRes,
    leaderboardRes,
    recentRes,
  ] = await Promise.all([
    supabase.from('student_contributions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('student_contributions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('student_contributions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('student_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('is_published', true).eq('is_expired', false),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('is_published', false).eq('is_expired', false),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('is_expired', true),
    supabase.from('opportunities').select('views_count'),
    supabase.from('student_points').select('total_points').order('total_points', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('student_points').select('*').order('total_points', { ascending: false }).limit(5),
    supabase.from('student_contributions').select('*').order('created_at', { ascending: false }).limit(8),
  ]);

  const totalViews = (viewsRes.data || []).reduce((s: number, r: any) => s + (r.views_count || 0), 0);

  return {
    pending:        pendingRes.count  || 0,
    approved:       approvedRes.count || 0,
    rejected:       rejectedRes.count || 0,
    students:       studentsRes.count || 0,
    listings:       listingsRes.count || 0,
    liveListings:   liveRes.count     || 0,
    draftListings:  draftRes.count    || 0,
    expiredListings:expiredRes.count  || 0,
    totalViews,
    topScore:       topRes.data?.total_points || 0,
    leaderboard:    leaderboardRes.data || [],
    recent:         recentRes.data     || [],
  };
}

export default function AdminDashboardPage() {
  const supabase = useRef(createClient());
  const [data, setData] = useState<DashboardData | null>(null);

  async function refresh() {
    const d = await loadData(supabase.current);
    setData(d);
  }

  useEffect(() => {
    refresh();

    // Real-time subscriptions
    const ch1 = supabase.current
      .channel('dash-contributions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_contributions' }, refresh)
      .subscribe();

    const ch2 = supabase.current
      .channel('dash-opportunities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, refresh)
      .subscribe();

    const ch3 = supabase.current
      .channel('dash-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_profiles' }, refresh)
      .subscribe();

    return () => {
      ch1.unsubscribe();
      ch2.unsubscribe();
      ch3.unsubscribe();
    };
  }, []);

  if (!data) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalModerated = data.approved + data.rejected;
  const approvalRate   = totalModerated > 0 ? Math.round((data.approved / totalModerated) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Platform overview, analytics and quick actions</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live sync active
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashCard icon={<Briefcase className="w-5 h-5" />} label="Total Listings" value={data.listings} color="blue" trend="+4 this week" />
        <DashCard icon={<CheckCircle2 className="w-5 h-5" />} label="Live Listings" value={data.liveListings} color="green" trend="Currently active" />
        <DashCard icon={<Users className="w-5 h-5" />} label="Students" value={data.students} color="indigo" trend="Registered" />
        <DashCard icon={<Eye className="w-5 h-5" />} label="Total Views" value={data.totalViews} color="purple" trend="All time" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashCard icon={<Clock3 className="w-5 h-5" />} label="Pending Review" value={data.pending} color="yellow"
          trend={data.pending > 0 ? 'Needs attention' : 'All clear'} />
        <DashCard icon={<CheckCircle2 className="w-5 h-5" />} label="Approved" value={data.approved} color="green" trend="Contributions" />
        <DashCard icon={<XCircle className="w-5 h-5" />} label="Rejected" value={data.rejected} color="red" trend="Contributions" />
        <DashCard icon={<Trophy className="w-5 h-5" />} label="Top Score" value={data.topScore} color="amber" trend="Points" />
      </div>

      {/* Middle Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Moderation Analytics */}
        <div className="admin-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Moderation Analytics</h2>
          </div>
          <div className="space-y-5">
            <Metric label="Approval Rate" value={`${approvalRate}%`} accent="green" />
            <Metric label="Total Moderated" value={totalModerated} accent="blue" />
            <Metric label="Pending Queue" value={data.pending} accent={data.pending > 5 ? 'red' : 'yellow'} />
          </div>
          {/* Mini bar chart */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-3">Listing Status Breakdown</p>
            <div className="flex gap-2 h-2 rounded-full overflow-hidden">
              <div className="bg-green-500" style={{ width: `${data.listings > 0 ? (data.liveListings/data.listings)*100 : 0}%` }} />
              <div className="bg-amber-500" style={{ width: `${data.listings > 0 ? (data.draftListings/data.listings)*100 : 0}%` }} />
              <div className="bg-red-500"   style={{ width: `${data.listings > 0 ? (data.expiredListings/data.listings)*100 : 0}%` }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Live</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Draft</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Expired</span>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="admin-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-white">Top Contributors</h2>
            </div>
            <Link href="/admin/leaderboard" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {data.leaderboard.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No contributors yet</p>
          ) : (
            <div className="space-y-3">
              {data.leaderboard.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400' :
                    i === 1 ? 'bg-gray-400/20 text-gray-400' :
                    i === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-white/5 text-gray-500'
                  }`}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {item.student_name || item.user_id?.slice(0, 8) || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-400">{item.approved_contributions || 0} contributions</p>
                  </div>
                  <span className="text-sm font-bold text-amber-400">{item.total_points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="admin-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="space-y-2.5">
            <QuickAction href="/admin/new" icon={<PlusCircle className="w-4 h-4" />} label="Add New Listing" color="blue" />
            <QuickAction href="/admin/listings" icon={<List className="w-4 h-4" />} label="Manage Listings" color="gray" />
            <QuickAction href="/admin/contributions" icon={<MessageSquare className="w-4 h-4" />} label="Review Contributions" color="gray"
              badge={data.pending > 0 ? data.pending : undefined} />
            <QuickAction href="/admin/students" icon={<Users className="w-4 h-4" />} label="View Students" color="gray" />
            <QuickAction href="/admin/leaderboard" icon={<Trophy className="w-4 h-4" />} label="Leaderboard" color="gray" />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Contributions */}
        <div className="admin-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-white">Recent Contributions</h2>
            </div>
            <Link href="/admin/contributions" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No contributions yet</p>
          ) : (
            <div className="space-y-2">
              {data.recent.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-400 truncate">{item.contributor_name || 'Anonymous'}</p>
                  </div>
                  <StatusChip status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Controls */}
        <div className="admin-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Feature Controls</h2>
          </div>
          <AdminControlCenter />
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DashCard({ icon, label, value, color, trend }: {
  icon: React.ReactNode; label: string; value: number; color: string; trend?: string;
}) {
  const styles: Record<string, { border: string; icon: string }> = {
    blue:   { border: 'border-blue-500/20',   icon: 'bg-blue-500/20 text-blue-400'   },
    green:  { border: 'border-green-500/20',  icon: 'bg-green-500/20 text-green-400' },
    indigo: { border: 'border-indigo-500/20', icon: 'bg-indigo-500/20 text-indigo-400' },
    purple: { border: 'border-purple-500/20', icon: 'bg-purple-500/20 text-purple-400' },
    yellow: { border: 'border-amber-500/20',  icon: 'bg-amber-500/20 text-amber-400'  },
    red:    { border: 'border-red-500/20',    icon: 'bg-red-500/20 text-red-400'      },
    amber:  { border: 'border-amber-500/20',  icon: 'bg-amber-500/20 text-amber-400'  },
  };
  const s = styles[color] || styles.blue;

  return (
    <div className={`admin-card rounded-xl p-5 border ${s.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.icon}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {trend && <p className="text-xs text-gray-500 mt-0.5">{trend}</p>}
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  const accentMap: Record<string, string> = {
    green: 'text-green-400', blue: 'text-blue-400', red: 'text-red-400', yellow: 'text-amber-400',
  };
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-lg font-bold ${accentMap[accent] || 'text-white'}`}>{value}</span>
    </div>
  );
}

function QuickAction({ href, icon, label, color, badge }: {
  href: string; icon: React.ReactNode; label: string; color: string; badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150 group ${
        color === 'blue'
          ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'
          : 'border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={color === 'blue' ? 'text-white' : 'text-gray-400 group-hover:text-white'}>{icon}</span>
      <span className="text-sm font-medium flex-1">{label}</span>
      {badge !== undefined && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  'bg-amber-500/20 text-amber-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md shrink-0 ${map[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}