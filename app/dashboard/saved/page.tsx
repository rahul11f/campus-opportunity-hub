'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Bookmark, ExternalLink, Trash2, Search, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

function daysLeft(deadline?: string | null) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const TYPE_COLORS: Record<string, string> = {
  internship:   'bg-emerald-500/10 text-emerald-500',
  placement:    'bg-blue-500/10 text-blue-500',
  campus_drive: 'bg-cyan-500/10 text-cyan-500',
  hackathon:    'bg-violet-500/10 text-violet-500',
  scholarship:  'bg-amber-500/10 text-amber-500',
  fellowship:   'bg-orange-500/10 text-orange-500',
  competition:  'bg-rose-500/10 text-rose-500',
};

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = useRef(createClient());

  async function load() {
    const { data: { user } } = await supabase.current.auth.getUser();
    if (!user) return;

    const { data } = await supabase.current
      .from('student_saved_opportunities')
      .select('*, opportunities(id,role,company,type,deadline,salary,location,apply_link,source_link,featured)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setSaved(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function removeSaved(saveId: string) {
    await supabase.current.from('student_saved_opportunities').delete().eq('id', saveId);
    setSaved((prev) => prev.filter((s) => s.id !== saveId));
    toast.success('Removed from saved');
  }

  async function applyNow(opp: any, saveId: string) {
    const { data: { user } } = await supabase.current.auth.getUser();
    if (!user) return;

    // Add to applications
    await supabase.current.from('student_applications').upsert(
      { user_id: user.id, opportunity_id: opp.id, status: 'applying' },
      { onConflict: 'user_id,opportunity_id' }
    );
    toast.success('Added to your applications tracker!');
  }

  const filtered = saved.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const opp = s.opportunities;
    return opp?.role?.toLowerCase().includes(q) || opp?.company?.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Opportunities</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {saved.length} saved — never miss an application deadline
        </p>
      </div>

      {/* Search */}
      {saved.length > 0 && (
        <div className="flex items-center gap-2 border rounded-xl px-4 py-2.5 bg-card max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Filter saved..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 text-center">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold mb-2">No saved opportunities</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Browse opportunities and click the bookmark icon to save them here.
          </p>
          <Link href="/search" className="text-primary text-sm hover:underline flex items-center justify-center gap-1">
            Browse Opportunities <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const opp = s.opportunities;
            if (!opp) return null;
            const days = daysLeft(opp.deadline);
            const applyLink = opp.apply_link || opp.source_link;

            return (
              <div key={s.id} className="rounded-xl border bg-card p-5 hover:border-primary/30 transition-colors space-y-4">
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      href={`/opportunities/${opp.id}`}
                      className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2"
                    >
                      {opp.role}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">{opp.company}</p>
                  </div>
                  <button
                    onClick={() => removeSaved(s.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {opp.type && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[opp.type] || 'bg-muted text-muted-foreground'}`}>
                      {opp.type}
                    </span>
                  )}
                  {opp.location && (
                    <span className="text-[10px] text-muted-foreground">{opp.location}</span>
                  )}
                  {opp.salary && (
                    <span className="text-[10px] text-muted-foreground">₹ {opp.salary}</span>
                  )}
                </div>

                {/* Deadline */}
                {days !== null && (
                  <div className={`text-xs font-medium ${
                    days < 0 ? 'text-red-500' : days === 0 ? 'text-red-500' : days <= 3 ? 'text-amber-500' : 'text-green-500'
                  }`}>
                    {days < 0 ? 'Expired' : days === 0 ? '⚡ Ends today' : `⏰ ${days} days left`}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {applyLink && days !== null && days >= 0 && (
                    <a
                      href={applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => applyNow(opp, s.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Apply Now
                    </a>
                  )}
                  <a
                    href={`/opportunities/${opp.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-accent transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}