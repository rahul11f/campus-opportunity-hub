'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Briefcase,
  ExternalLink,
  Clock3,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

const STAGES = [
  { id: 'saved',       label: 'Saved',       color: 'bg-gray-500/10 text-gray-400 border-gray-500/20'    },
  { id: 'applying',    label: 'Applying',    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'     },
  { id: 'applied',     label: 'Applied',     color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { id: 'oa',          label: 'Online Assessment', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'interview',   label: 'Interview',   color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { id: 'hr',          label: 'HR Round',    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'     },
  { id: 'offer',       label: '🎉 Offer',    color: 'bg-green-500/10 text-green-400 border-green-500/20'  },
  { id: 'rejected',    label: 'Rejected',    color: 'bg-red-500/10 text-red-400 border-red-500/20'        },
];

function daysLeft(deadline?: string | null) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const supabase = useRef(createClient());

  async function load() {
    const { data: { user } } = await supabase.current.auth.getUser();
    if (!user) return;

    const { data } = await supabase.current
      .from('student_applications')
      .select('*, opportunities(id, role, company, type, deadline, apply_link, source_link)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    setApps(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(appId: string, status: string) {
    const { error } = await supabase.current
      .from('student_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appId);

    if (error) { toast.error('Update failed'); return; }
    setApps((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
    toast.success(`Moved to ${status}`);
  }

  async function removeApp(appId: string) {
    if (!confirm('Remove this application?')) return;
    const { error } = await supabase.current.from('student_applications').delete().eq('id', appId);
    if (error) { toast.error('Failed to remove'); return; }
    setApps((prev) => prev.filter((a) => a.id !== appId));
    toast.success('Removed');
  }

  const filtered = apps.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.opportunities?.role?.toLowerCase().includes(q) ||
      a.opportunities?.company?.toLowerCase().includes(q)
    );
  });

  const byStage = Object.fromEntries(STAGES.map((s) => [s.id, filtered.filter((a) => a.status === s.id)]));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Application Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your job applications across all stages — {apps.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
          >
            List
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
          >
            Kanban
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border rounded-xl px-4 py-2.5 bg-card max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
      </div>

      {/* Stage Progress Bar */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {STAGES.slice(0, 5).map((s) => (
          <div key={s.id} className={`rounded-xl border ${s.color} p-3`}>
            <p className="text-xs font-medium">{s.label}</p>
            <p className="text-xl font-bold mt-1">{byStage[s.id]?.length || 0}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold mb-2">No applications yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            When you save or apply to opportunities, they appear here.
          </p>
          <Link href="/search" className="text-primary text-sm hover:underline">
            Browse Opportunities →
          </Link>
        </div>
      ) : view === 'list' ? (
        /* List View */
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div>Opportunity</div>
            <div>Stage</div>
            <div>Deadline</div>
            <div>Move to</div>
            <div />
          </div>
          {filtered.map((app) => {
            const opp  = app.opportunities || {};
            const days = daysLeft(opp.deadline);
            const applyLink = opp.apply_link || opp.source_link;
            const currentIdx = STAGES.findIndex((s) => s.id === app.status);

            return (
              <div key={app.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b items-center hover:bg-accent/50 transition-colors">
                <div className="min-w-0">
                  <Link href={`/opportunities/${opp.id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">
                    {opp.role || 'Opportunity'}
                  </Link>
                  <p className="text-xs text-muted-foreground">{opp.company}</p>
                </div>

                <StageBadge stage={app.status} />

                <div className="text-sm">
                  {opp.deadline ? (
                    <>
                      <p className="text-xs text-muted-foreground">{new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      {days !== null && days >= 0 && (
                        <p className={`text-xs font-medium ${days <= 3 ? 'text-red-500' : days <= 7 ? 'text-amber-500' : 'text-green-500'}`}>
                          {days === 0 ? 'Today' : `${days}d left`}
                        </p>
                      )}
                    </>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </div>

                <div>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="text-xs bg-background border rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  {applyLink && (
                    <a href={applyLink} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => removeApp(app.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div key={stage.id} className="min-w-[220px] w-[220px] shrink-0">
              <div className={`px-3 py-2 rounded-t-xl border ${stage.color} flex items-center justify-between`}>
                <span className="text-xs font-semibold">{stage.label}</span>
                <span className="text-xs font-bold">{byStage[stage.id]?.length || 0}</span>
              </div>
              <div className="space-y-2 p-2 bg-muted/20 rounded-b-xl border border-t-0 min-h-[120px]">
                {(byStage[stage.id] || []).map((app: any) => (
                  <div key={app.id} className="bg-card rounded-xl border p-3 shadow-sm">
                    <p className="text-xs font-semibold line-clamp-2">{app.opportunities?.role}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{app.opportunities?.company}</p>
                    <div className="flex items-center justify-between mt-2">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className="text-[10px] bg-muted border rounded px-1 py-0.5 outline-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      <button onClick={() => removeApp(app.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const s = STAGES.find((x) => x.id === stage);
  if (!s) return null;
  return (
    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${s.color} w-fit`}>
      {s.label}
    </span>
  );
}