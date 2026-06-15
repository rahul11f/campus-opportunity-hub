'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { FileText, CheckCircle2, Clock3, XCircle, Trophy, ExternalLink, ArrowRight, Send } from 'lucide-react';

export default function MyContributionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [points, setPoints] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const supabase = useRef(createClient());

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.current.auth.getUser();
      if (!user) return;

      const [contribs, pts] = await Promise.all([
        supabase.current.from('student_contributions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.current.from('student_points').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      setItems(contribs.data || []);
      setPoints(pts.data);
      setLoading(false);
    }

    load();
  }, []);

  const pending  = items.filter((x) => x.status === 'pending').length;
  const approved = items.filter((x) => x.status === 'approved').length;
  const rejected = items.filter((x) => x.status === 'rejected').length;

  const filtered = filter === 'all' ? items : items.filter((x) => x.status === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Contributions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Notices you submitted — help fellow students, earn points!
          </p>
        </div>
        <Link
          href="/dashboard/contribute"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" /> Submit New
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-lg font-bold">{points?.total_points || 0}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <Clock3 className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-lg font-bold">{pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-lg font-bold">{approved}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-lg font-bold">{rejected}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && <span className="ml-1 opacity-70">({f === 'pending' ? pending : f === 'approved' ? approved : rejected})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold mb-2">
            {filter === 'all' ? 'No contributions yet' : `No ${filter} contributions`}
          </h3>
          {filter === 'all' && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Submit campus notices, job posts, or notices from WhatsApp/Telegram to earn points.
              </p>
              <Link href="/dashboard/contribute" className="text-primary text-sm hover:underline flex items-center justify-center gap-1">
                Submit your first notice <ArrowRight className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <ContributionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContributionCard({ item }: { item: any }) {
  const STATUS_MAP: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    pending:  { icon: <Clock3 className="w-3.5 h-3.5" />,      label: 'Pending Review', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'  },
    approved: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Approved',       color: 'text-green-500 bg-green-500/10 border-green-500/20'    },
    rejected: { icon: <XCircle className="w-3.5 h-3.5" />,      label: 'Rejected',       color: 'text-red-500 bg-red-500/10 border-red-500/20'          },
  };
  const statusConfig = STATUS_MAP[item.status] || { icon: null, label: item.status, color: '' };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-sm">{item.title || 'Untitled contribution'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{item.contribution_type}</p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border shrink-0 ${statusConfig.color}`}>
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>

      {item.content && (
        <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 rounded-lg p-3">
          {item.content}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <div className="flex items-center gap-3">
          {item.points_awarded > 0 && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Trophy className="w-3 h-3" /> +{item.points_awarded} pts
            </span>
          )}
          {item.source_link && (
            <a href={item.source_link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {item.status === 'rejected' && item.admin_notes && (
        <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 text-xs text-red-400">
          <strong>Admin feedback:</strong> {item.admin_notes}
        </div>
      )}
    </div>
  );
}