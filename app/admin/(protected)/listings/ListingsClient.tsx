'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  Filter,
  Eye,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ─── helpers ────────────────────────────────────────────────────────────────

function getDaysInfo(deadline?: string | null) {
  if (!deadline) return null;
  const now = new Date();
  const end = new Date(deadline);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name?: string | null) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const TYPE_COLORS: Record<string, string> = {
  internship:  'bg-emerald-500/20 text-emerald-400',
  placement:   'bg-blue-500/20 text-blue-400',
  campus_drive:'bg-cyan-500/20 text-cyan-400',
  hackathon:   'bg-violet-500/20 text-violet-400',
  scholarship: 'bg-amber-500/20 text-amber-400',
  fellowship:  'bg-orange-500/20 text-orange-400',
  competition: 'bg-rose-500/20 text-rose-400',
  other:       'bg-gray-500/20 text-gray-400',
  job:         'bg-sky-500/20 text-sky-400',
  notice:      'bg-purple-500/20 text-purple-400',
  workshop:    'bg-pink-500/20 text-pink-400',
};

const LOGO_PRESETS: Record<string, string> = {
  google: 'bg-red-600', amazon: 'bg-orange-700', microsoft: 'bg-blue-600',
  netflix: 'bg-red-700', tcs: 'bg-blue-700', infosys: 'bg-blue-500',
  wipro: 'bg-green-700', meta: 'bg-blue-800', apple: 'bg-gray-700',
  deloitte: 'bg-green-800', zomato: 'bg-red-600',
};

function getLogoColor(company?: string | null) {
  const key = (company || '').toLowerCase().replace(/\s+/g, '');
  for (const [k, v] of Object.entries(LOGO_PRESETS)) {
    if (key.includes(k)) return v;
  }
  const pool = [
    'bg-blue-600','bg-indigo-600','bg-violet-600','bg-purple-600',
    'bg-pink-600','bg-rose-600','bg-red-600','bg-orange-600',
    'bg-amber-600','bg-emerald-600','bg-teal-600','bg-cyan-600',
  ];
  let hash = 0;
  for (const c of (company || '')) hash = (hash * 31 + c.charCodeAt(0)) % pool.length;
  return pool[hash];
}

const PAGE_SIZE = 10;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ListingsClient({ data: initialData }: { data: any[] }) {
  const [data, setData] = useState<any[]>(initialData);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'live' | 'draft' | 'expired'>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const supabase = useRef(createClient());

  // ── Real-time sync ─────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase.current
      .channel('listings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData((prev) => [payload.new as any, ...prev]);
          toast.info(`New: ${(payload.new as any).role || 'Untitled'}`);
        } else if (payload.eventType === 'UPDATE') {
          setData((prev) =>
            prev.map((r) => r.id === (payload.new as any).id ? { ...r, ...payload.new } : r)
          );
        } else if (payload.eventType === 'DELETE') {
          setData((prev) => prev.filter((r) => r.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────
  const total   = data.length;
  const live    = data.filter((x) => x.is_published && !x.is_expired).length;
  const draft   = data.filter((x) => !x.is_published && !x.is_expired).length;
  const expired = data.filter((x) => x.is_expired).length;

  // ── Filtered + Paginated ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return data.filter((item) => {
      const q = query.toLowerCase();
      const match = !q ||
        item.role?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q);
      if (!match) return false;
      if (tab === 'live')    return item.is_published && !item.is_expired;
      if (tab === 'draft')   return !item.is_published && !item.is_expired;
      if (tab === 'expired') return item.is_expired;
      return true;
    });
  }, [data, query, tab]);

  useEffect(() => { setPage(1); }, [tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Actions ────────────────────────────────────────────────────────────
  const patch = useCallback(async (id: string, body: Record<string, unknown>, label: string) => {
    setLoading((l) => ({ ...l, [id]: true }));
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Update failed');
      toast.success(label);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setLoading((l) => ({ ...l, [id]: false }));
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    setLoading((l) => ({ ...l, [id]: true }));
    try {
      const res = await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Deleted successfully');
    } catch {
      toast.error('Delete failed');
    } finally {
      setLoading((l) => ({ ...l, [id]: false }));
    }
  }, []);

  // ── Pagination helper ─────────────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, totalPages]);

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">All Opportunities</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all opportunities and listings on the platform</p>
        </div>
        <Link
          href="/admin/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Opportunities" value={total}   sub="All time"            color="blue"   icon="📊" />
        <StatCard label="Live"                value={live}    sub="Currently published"  color="green"  icon="🟢" />
        <StatCard label="Draft"               value={draft}   sub="Not published"        color="yellow" icon="📝" />
        <StatCard label="Expired"             value={expired} sub="Past deadline"        color="red"    icon="⏰" />
      </div>

      {/* Filter Bar */}
      <div className="admin-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'live', 'draft', 'expired'] as const).map((t) => {
            const count = t === 'all' ? total : t === 'live' ? live : t === 'draft' ? draft : expired;
            const activeStyle = {
              all:     'bg-blue-600 text-white',
              live:    'bg-green-600/20 text-green-400 ring-1 ring-green-500/30',
              draft:   'bg-amber-600/20 text-amber-400 ring-1 ring-amber-500/30',
              expired: 'bg-red-600/20 text-red-400 ring-1 ring-red-500/30',
            }[t];
            const dotColor = { all: '', live: 'bg-green-400', draft: 'bg-amber-400', expired: 'bg-red-400' }[t];
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? activeStyle : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
                {t.charAt(0).toUpperCase() + t.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-60">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              placeholder="Search opportunities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent outline-none text-sm text-white placeholder-gray-500 w-full"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card rounded-xl overflow-hidden">
        {/* Table Head */}
        <div className="grid admin-table-grid px-5 py-3.5 border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Opportunity</div>
          <div>Type</div>
          <div>Status</div>
          <div>Deadline</div>
          <div>Views</div>
          <div>Source</div>
          <div>Actions</div>
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400 font-medium">No opportunities found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          paginated.map((item) => {
            const days    = getDaysInfo(item.deadline);
            const isLoading = loading[item.id];
            const isLive  = item.is_published && !item.is_expired;
            const isDraft = !item.is_published && !item.is_expired;
            const isExp   = item.is_expired;
            const typeKey = (item.type || 'other') as string;

            return (
              <div
                key={item.id}
                className="grid admin-table-grid px-5 py-4 border-b border-white/[0.06] items-center hover:bg-white/[0.025] transition-colors relative"
              >
                {/* Company + Role */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg ${getLogoColor(item.company)} flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden`}>
                    {item.company_logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.company_logo} alt="" className="w-full h-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    ) : getInitials(item.company)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{item.role || 'Untitled'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 truncate">{item.company}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[typeKey] || TYPE_COLORS.other}`}>
                        {typeKey}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Type badge */}
                <div>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${TYPE_COLORS[typeKey] || TYPE_COLORS.other}`}>
                    {typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}
                  </span>
                </div>

                {/* Status */}
                <div>
                  {isExp   ? <StatusDot color="red"    label="Expired" /> :
                   isLive  ? <StatusDot color="green"  label="Live"    /> :
                             <StatusDot color="yellow" label="Draft"   />}
                </div>

                {/* Deadline */}
                <div className="text-sm">
                  {item.deadline ? (
                    <>
                      <p className="text-gray-300 text-xs flex items-center gap-1">
                        <span className="text-gray-500">📅</span> {formatDate(item.deadline)}
                      </p>
                      {days !== null && (
                        <p className={`text-xs mt-0.5 ${
                          isExp ? 'text-red-400' :
                          days <= 3 ? 'text-red-400' :
                          days <= 7 ? 'text-amber-400' : 'text-green-400'
                        }`}>
                          {isExp
                            ? `${Math.abs(days)} days ago`
                            : days === 0 ? 'Today'
                            : `In ${days} days`}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500 text-xs">No deadline</span>
                  )}
                </div>

                {/* Views */}
                <div className="flex items-center gap-1.5 text-sm text-gray-300">
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                  {(item.views_count || item.views || 0).toLocaleString()}
                </div>

                {/* Source */}
                <div>
                  {item.source_type === 'student' ? (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 font-medium">Student</span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-gray-700/60 text-gray-400 font-medium">Admin</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 relative">
                  <Link
                    href={`/admin/edit-listing/${item.id}`}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors font-medium"
                  >
                    Edit
                  </Link>

                  {isExp ? (
                    <button
                      disabled={isLoading}
                      onClick={() => remove(item.id)}
                      className="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors font-medium disabled:opacity-40"
                    >
                      Delete
                    </button>
                  ) : isLive ? (
                    <button
                      disabled={isLoading}
                      onClick={() => patch(item.id, { is_published: false }, 'Unpublished')}
                      className="px-3 py-1.5 rounded-lg text-xs text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 transition-colors font-medium disabled:opacity-40"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      disabled={isLoading}
                      onClick={() => patch(item.id, { is_published: true, is_expired: false }, 'Published')}
                      className="px-3 py-1.5 rounded-lg text-xs text-green-400 border border-green-500/20 hover:bg-green-500/10 transition-colors font-medium disabled:opacity-40"
                    >
                      Publish
                    </button>
                  )}

                  {/* Kebab menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === item.id && (
                      <div className="absolute right-0 top-8 z-50 w-44 bg-[#1a1f2e] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                        <Link
                          href={`/admin/edit-listing/${item.id}`}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          onClick={() => setOpenMenu(null)}
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit Listing
                        </Link>
                        {!isExp && (isLive ? (
                          <button
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                            onClick={() => { patch(item.id, { is_published: false }, 'Unpublished'); setOpenMenu(null); }}
                          >
                            <ToggleLeft className="w-3.5 h-3.5" /> Unpublish
                          </button>
                        ) : (
                          <button
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-green-400 hover:bg-green-500/10 transition-colors"
                            onClick={() => { patch(item.id, { is_published: true, is_expired: false }, 'Published'); setOpenMenu(null); }}
                          >
                            <ToggleRight className="w-3.5 h-3.5" /> Publish
                          </button>
                        ))}
                        <button
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          onClick={() => { remove(item.id); setOpenMenu(null); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 flex items-center justify-between border-t border-white/10 flex-wrap gap-3">
          <span className="text-xs text-gray-500">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
          </span>
          <div className="flex items-center gap-1">
            <PgBtn onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft className="w-4 h-4" /></PgBtn>
            <PgBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></PgBtn>
            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  page === p ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && page < totalPages - 2 && <span className="text-gray-500 px-1">…</span>}
            {totalPages > 5 && !pageNumbers.includes(totalPages) && (
              <button
                onClick={() => setPage(totalPages)}
                className="w-8 h-8 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                {totalPages}
              </button>
            )}
            <PgBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></PgBtn>
            <PgBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight className="w-4 h-4" /></PgBtn>
          </div>
        </div>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <span>💡</span> Tip: Use filters to quickly find opportunities by status, type, source or date range.
      </p>

      {/* Close dropdown on outside click */}
      {openMenu && <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color, icon,
}: { label: string; value: number; sub: string; color: string; icon: string }) {
  const grad: Record<string, string> = {
    blue:   'from-blue-600/20 to-transparent border-blue-500/20',
    green:  'from-green-600/20 to-transparent border-green-500/20',
    yellow: 'from-amber-600/20 to-transparent border-amber-500/20',
    red:    'from-red-600/20 to-transparent border-red-500/20',
  };
  const iBg: Record<string, string> = {
    blue:   'bg-blue-500/20 text-blue-400',
    green:  'bg-green-500/20 text-green-400',
    yellow: 'bg-amber-500/20 text-amber-400',
    red:    'bg-red-500/20 text-red-400',
  };
  return (
    <div className={`admin-card rounded-xl p-5 bg-gradient-to-br border ${grad[color] || grad.blue}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${iBg[color]}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function StatusDot({ color, label }: { color: 'green' | 'yellow' | 'red'; label: string }) {
  const text = { green: 'text-green-400', yellow: 'text-amber-400', red: 'text-red-400' };
  const dot  = { green: 'bg-green-400',   yellow: 'bg-amber-400',   red: 'bg-red-400'   };
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${text[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[color]}`} />
      {label}
    </span>
  );
}

function PgBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}