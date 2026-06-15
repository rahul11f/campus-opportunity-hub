'use client';

import { useEffect, useState, useRef } from 'react';
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

  async function approve(item: any) {
    const title            = prompt('Edit title before approval', item.title) || item.title;
    const contributionType = prompt('Edit type', item.contribution_type) || item.contribution_type;
    const content          = prompt('Edit content before approval', item.content) || item.content;

    const res = await fetch('/api/admin/contributions/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contributionId: item.id, title, content, contributionType }),
    });

    const data = await res.json();
    if (!res.ok) { toast.error(data.error || 'Approval failed'); return; }
    toast.success('Contribution approved');
    load();
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
        <h1 className="text-2xl font-bold text-white">Contributions</h1>
        <p className="text-gray-400 text-sm mt-1">Review student-submitted notices before publishing</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ id, label, color }) => {
          const activeMap: Record<string, string> = {
            amber: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30',
            green: 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30',
            red:   'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
          };
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? activeMap[color] : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="admin-card rounded-xl p-16 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-400 font-medium">No {tab} contributions</p>
        </div>
      )}

      {/* Cards */}
      {!loading && items.map((item) => (
        <div key={item.id} className="admin-card rounded-xl p-6 space-y-5">
          {/* Meta row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetaChip icon={<User className="w-3.5 h-3.5" />} label="Contributor" value={item.contributor_name} />
            <MetaChip icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={item.contributor_email} />
            <MetaChip icon={<IdCard className="w-3.5 h-3.5" />} label="Student ID" value={item.contributor_student_id || 'N/A'} />
            <MetaChip icon={<Clock3 className="w-3.5 h-3.5" />} label="Status" value={item.status} />
          </div>

          {/* Title & type */}
          <div>
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
            <span className="text-xs text-gray-400 mt-1 inline-block">{item.contribution_type}</span>
          </div>

          {/* Content */}
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {item.content}
          </div>

          {/* Source link */}
          {item.source_link && (
            <a
              href={item.source_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Preview Source
            </a>
          )}

          {/* Rejection reason */}
          {item.rejection_reason && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <strong>Rejection reason:</strong> {item.rejection_reason}
            </div>
          )}

          {/* Actions */}
          {tab === 'pending' && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => approve(item)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
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
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
      <div className="flex items-center gap-1.5 mb-1 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-white break-all">{value || '—'}</p>
    </div>
  );
}