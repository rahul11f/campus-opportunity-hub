'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  User,
  Mail,
  IdCard,
  Clock3,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContributionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const supabase = useRef(createClient());
  const router = useRouter();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contributions/list?status=' + tab);
      const data = await res.json();
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [tab]);

  useEffect(() => {
    const channel = supabase.current
      .channel(`admin-contrib-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_contributions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.info('New student contribution received!');
        }
        // Just reload the current tab
        load();
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function parseWithAI(item: any) {
    try {
      setLoading(true);
      const payload = new FormData();
      payload.append('method', 'text');
      
      // If it's a URL, parse it as a URL
      if (item.source_link) {
        payload.set('method', 'url');
        payload.set('content', item.source_link);
      } else {
        payload.set('content', item.content || item.title);
      }

      const res = await fetch('/api/parse', {
        method: 'POST',
        body: payload,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse');
      }

      const data = await res.json();
      
      localStorage.setItem('draft_opportunity', JSON.stringify(data.opportunity));
      localStorage.setItem('draft_contribution_id', item.id);
      
      router.push('/admin/new?draft=true');
    } catch (err: any) {
      toast.error(err.message || 'Parsing failed');
    } finally {
      setLoading(false);
    }
  }

  async function reject(item: any) {
    const rejectionReason = prompt('Rejection reason') || 'Rejected by admin';

    const res = await fetch('/api/admin/contributions/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contributionId: item.id, rejectionReason }),
    });

    if (!res.ok) { toast.error('Reject failed'); return; }
    toast.success('Contribution rejected');
    load();
  }

  const tabs = [
    { id: 'pending',  label: 'Pending',  color: 'amber' },
    { id: 'approved', label: 'Approved', color: 'green' },
    { id: 'rejected', label: 'Rejected', color: 'red'   },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contributions</h1>
        <p className="text-slate-500 text-sm mt-1">Review student-submitted notices before publishing</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ id, label, color }) => {
          const activeMap: Record<string, string> = {
            amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
            green: 'bg-green-50 text-green-700 ring-1 ring-green-200',
            red:   'bg-red-50 text-red-700 ring-1 ring-red-200',
          };
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? activeMap[color] : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="admin-card rounded-xl p-16 text-center border border-slate-200 bg-white">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-400 font-medium">No {tab} contributions</p>
        </div>
      )}

      {/* Cards */}
      {!loading && items.map((item) => (
        <div key={item.id} className="admin-card rounded-xl p-6 space-y-5 border border-slate-200 bg-white">
          {/* Meta row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg">
            <MetaChip icon={<User className="w-3.5 h-3.5" />} label="Contributor" value={item.contributor_name} />
            <MetaChip icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={item.contributor_email} />
            <MetaChip icon={<IdCard className="w-3.5 h-3.5" />} label="Student ID" value={item.contributor_student_id || 'N/A'} />
            <MetaChip icon={<Clock3 className="w-3.5 h-3.5" />} label="Status" value={item.status} />
          </div>

          {/* Title & type */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
            <span className="text-xs text-slate-500 mt-1 inline-block bg-slate-100 px-2 py-0.5 rounded uppercase font-bold">{item.contribution_type}</span>
          </div>

          {/* Content */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {item.content}
          </div>

          {/* Source link */}
          {item.source_link && (
            <a
              href={item.source_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Preview Source
            </a>
          )}

          {/* Rejection reason */}
          {item.rejection_reason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <strong>Rejection reason:</strong> {item.rejection_reason}
            </div>
          )}

          {/* Actions */}
          {tab === 'pending' && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => parseWithAI(item)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Parse via AI
              </button>
              <button
                onClick={() => reject(item)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MetaChip({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="rounded-lg bg-white border border-slate-200 p-3">
      <div className="flex items-center gap-1.5 mb-1 text-slate-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-900 break-all">{value || '—'}</p>
    </div>
  );
}