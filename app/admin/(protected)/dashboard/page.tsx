'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Users, Trophy, Clock3, CheckCircle2, XCircle, Briefcase, TrendingUp,
  Activity, Zap, Eye, PlusCircle, List, MessageSquare, ArrowUpRight, BarChart3,
  Bot
} from 'lucide-react';
import { AdminControlCenter } from '@/components/admin/AdminControlCenter';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

interface DashboardData {
  pending: number; approved: number; rejected: number;
  students: number; listings: number; liveListings: number;
  draftListings: number; expiredListings: number; totalViews: number;
  topScore: number; leaderboard: any[]; recent: any[];
}

async function loadData(supabase: ReturnType<typeof createClient>): Promise<DashboardData> {
  const [
    pendingRes, approvedRes, rejectedRes, studentsRes, listingsRes,
    liveRes, draftRes, expiredRes, viewsRes, topRes, leaderboardRes, recentRes,
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

    const ch1 = supabase.current.channel('dash-contributions').on('postgres_changes', { event: '*', schema: 'public', table: 'student_contributions' }, refresh).subscribe();
    const ch2 = supabase.current.channel('dash-opportunities').on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, refresh).subscribe();
    const ch3 = supabase.current.channel('dash-profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'student_profiles' }, refresh).subscribe();

    return () => { ch1.unsubscribe(); ch2.unsubscribe(); ch3.unsubscribe(); };
  }, []);

  if (!data) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 space-y-8 max-w-7xl mx-auto pb-32">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between gap-4 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-transparent blur-3xl -z-10 rounded-full" />
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Platform Overview & Analytics
          </p>
        </div>
      </motion.div>

      {/* Primary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashCard icon={<Briefcase className="w-5 h-5" />} label="Total Listings" value={data.listings} color="blue" trend="All time" />
        <DashCard icon={<CheckCircle2 className="w-5 h-5" />} label="Live Listings" value={data.liveListings} color="emerald" trend="Currently active" />
        <DashCard icon={<Users className="w-5 h-5" />} label="Students" value={data.students} color="indigo" trend="Registered" />
        <DashCard icon={<Eye className="w-5 h-5" />} label="Total Views" value={data.totalViews} color="purple" trend="All time" />
      </motion.div>

      {/* Secondary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashCard icon={<Clock3 className="w-5 h-5" />} label="Pending Review" value={data.pending} color="amber" trend={data.pending > 0 ? 'Needs attention' : 'All clear'} />
        <DashCard icon={<CheckCircle2 className="w-5 h-5" />} label="Approved" value={data.approved} color="emerald" trend="Contributions" />
        <DashCard icon={<XCircle className="w-5 h-5" />} label="Rejected" value={data.rejected} color="rose" trend="Contributions" />
        <DashCard icon={<Trophy className="w-5 h-5" />} label="Top Score" value={data.topScore} color="amber" trend="Points" />
      </motion.div>

      {/* Middle Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="admin-card rounded-3xl p-6 border border-white/5 bg-background/50 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <QuickAction href="/admin/parser" icon={<Bot className="w-4 h-4" />} label="AI Parser Dashboard" color="indigo" badge="New" />
            <QuickAction href="/admin/new" icon={<PlusCircle className="w-4 h-4" />} label="Manual Data Entry" color="blue" />
            <QuickAction href="/admin/contributions" icon={<MessageSquare className="w-4 h-4" />} label="Review Contributions" color="gray" badge={data.pending > 0 ? data.pending : undefined} />
            <QuickAction href="/admin/listings" icon={<List className="w-4 h-4" />} label="Manage Listings" color="gray" />
            <QuickAction href="/admin/students" icon={<Users className="w-4 h-4" />} label="View Students" color="gray" />
          </div>
        </motion.div>

        {/* Moderation Analytics */}
        <motion.div variants={itemVariants} className="admin-card rounded-3xl p-6 border border-white/5 bg-background/50 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Analytics</h2>
          </div>
          <div className="space-y-4">
            <Metric label="Approval Rate" value={`${approvalRate}%`} accent="emerald" />
            <Metric label="Total Moderated" value={totalModerated} accent="blue" />
            <Metric label="Pending Queue" value={data.pending} accent={data.pending > 5 ? 'rose' : 'amber'} />
          </div>
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Listing Status Breakdown</p>
            <div className="flex gap-2 h-2.5 rounded-full overflow-hidden bg-white/5">
              <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${data.listings > 0 ? (data.liveListings/data.listings)*100 : 0}%` }} />
              <div className="bg-amber-500 transition-all duration-1000" style={{ width: `${data.listings > 0 ? (data.draftListings/data.listings)*100 : 0}%` }} />
              <div className="bg-rose-500 transition-all duration-1000"   style={{ width: `${data.listings > 0 ? (data.expiredListings/data.listings)*100 : 0}%` }} />
            </div>
            <div className="flex gap-4 mt-3 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Live</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Draft</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Expired</span>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={itemVariants} className="admin-card rounded-3xl p-6 border border-white/5 bg-background/50 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Top Contributors</h2>
            </div>
            <Link href="/admin/leaderboard" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {data.leaderboard.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No contributors yet</p>
          ) : (
            <div className="space-y-3">
              {data.leaderboard.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                    i === 1 ? 'bg-gray-400/20 text-gray-400 border border-gray-400/20' :
                    i === 2 ? 'bg-orange-600/20 text-orange-400 border border-orange-600/20' : 'bg-white/5 text-gray-500'
                  }`}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.student_name || item.user_id?.slice(0, 8) || 'Anonymous'}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500">{item.approved_contributions || 0} contributions</p>
                  </div>
                  <span className="text-sm font-black text-amber-400">{item.total_points}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Contributions */}
        <motion.div variants={itemVariants} className="admin-card rounded-3xl p-6 border border-white/5 bg-background/50 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            </div>
            <Link href="/admin/contributions" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {data.recent.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{item.contributor_name || 'Anonymous'}</p>
                  </div>
                  <StatusChip status={item.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Feature Controls */}
        <motion.div variants={itemVariants} className="admin-card rounded-3xl p-6 border border-white/5 bg-background/50 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">System Controls</h2>
          </div>
          <AdminControlCenter />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DashCard({ icon, label, value, color, trend }: {
  icon: React.ReactNode; label: string; value: number; color: string; trend?: string;
}) {
  const styles: Record<string, { border: string; icon: string; bg: string }> = {
    blue:    { border: 'border-blue-500/20',   icon: 'text-blue-400',   bg: 'bg-blue-500/10' },
    emerald: { border: 'border-emerald-500/20',icon: 'text-emerald-400',bg: 'bg-emerald-500/10' },
    indigo:  { border: 'border-indigo-500/20', icon: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    purple:  { border: 'border-purple-500/20', icon: 'text-purple-400', bg: 'bg-purple-500/10' },
    amber:   { border: 'border-amber-500/20',  icon: 'text-amber-400',  bg: 'bg-amber-500/10' },
    rose:    { border: 'border-rose-500/20',   icon: 'text-rose-400',   bg: 'bg-rose-500/10' },
  };
  const s = styles[color] || styles.blue;

  return (
    <div className={`group relative overflow-hidden rounded-3xl p-5 md:p-6 border ${s.border} bg-background/40 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-2xl`}>
      <div className={`absolute inset-0 ${s.bg} opacity-0 group-hover:opacity-50 transition-opacity`} />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.bg} ${s.icon}`}>{icon}</div>
        <div>
          <p className="text-3xl font-black text-white">{value.toLocaleString()}</p>
          <p className="text-sm font-semibold text-gray-400 mt-1">{label}</p>
          {trend && <p className="text-[11px] font-medium text-gray-500 mt-1">{trend}</p>}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  const accentMap: Record<string, string> = {
    emerald: 'text-emerald-400', blue: 'text-blue-400', rose: 'text-rose-400', amber: 'text-amber-400',
  };
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
      <span className="text-sm font-medium text-gray-400">{label}</span>
      <span className={`text-xl font-black ${accentMap[accent] || 'text-white'}`}>{value}</span>
    </div>
  );
}

function QuickAction({ href, icon, label, color, badge }: {
  href: string; icon: React.ReactNode; label: string; color: string; badge?: string | number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 group ${
        color === 'blue'
          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:-translate-y-0.5'
          : color === 'indigo'
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-0.5'
          : 'bg-white/[0.02] border-white/5 text-gray-300 hover:bg-white/[0.06] hover:text-white'
      }`}
    >
      <span className={color === 'blue' || color === 'indigo' ? 'text-white' : 'text-gray-400 group-hover:text-white'}>{icon}</span>
      <span className="text-sm font-semibold flex-1">{label}</span>
      {badge !== undefined && (
        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black tracking-wider uppercase flex items-center justify-center shadow-sm">
          {badge}
        </span>
      )}
      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </Link>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-lg border shrink-0 ${map[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {status}
    </span>
  );
}