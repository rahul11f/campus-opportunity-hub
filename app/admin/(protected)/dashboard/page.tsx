import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { PlusCircle, Eye, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const metadata: Metadata = { title: 'Admin Dashboard | Campus Opportunity Hub' };

async function getStats() {
  const supabase = createClient();

  const [total, published, expired, featured] = await Promise.all([
    supabase.from('opportunities').select('*', { count: 'exact', head: true }),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('is_expired', true),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('featured', true),
  ]);

  return {
    total: total.count || 0,
    published: published.count || 0,
    expired: expired.count || 0,
    featured: featured.count || 0,
    drafts: (total.count || 0) - (published.count || 0),
  };
}

async function getRecentListings() {
  const supabase = createClient();
  const { data } = await supabase
    .from('opportunities')
    .select('id, company, role, type, is_published, created_at, views_count, deadline')
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

async function getRecentLogs() {
  const supabase = createClient();
  const { data } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

export default async function AdminDashboardPage() {
  const [stats, listings, logs] = await Promise.all([
    getStats(),
    getRecentListings(),
    getRecentLogs(),
  ]);

  const statCards = [
    { label: 'Total Listings', value: stats.total, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Drafts', value: stats.drafts, icon: Clock, color: 'text-amber-500' },
    { label: 'Expired', value: stats.expired, icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of all campus opportunities</p>
        </div>
        <Link
          href="/admin/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent listings */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Listings</h2>
            <Link href="/admin/listings" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {listings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No listings yet</p>
            ) : (
              listings.map((l: any) => (
                <div key={l.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{l.role}</p>
                    <p className="text-xs text-muted-foreground">{l.company}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {l.views_count}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        l.is_published
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {l.is_published ? 'Live' : 'Draft'}
                    </span>
                    <Link
                      href={`/admin/listings/${l.id}/edit`}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{log.action}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(parseISO(log.created_at), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

