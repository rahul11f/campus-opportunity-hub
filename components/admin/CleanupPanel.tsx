'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, Calendar, FileText, CheckCircle2 } from 'lucide-react';

type PendingOpportunity = {
  id: string;
  company: string;
  role: string;
  deadline: string;
  retention_days: number;
  attachments_json: any[] | null;
};

export function CleanupPanel() {
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [data, setData] = useState<{ count: number; opportunities: PendingOpportunity[] } | null>(null);

  async function loadPending() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cleanup-expired');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      toast.error('Failed to load cleanup preview');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleCleanup() {
    const confirmed = confirm(
      `Warning: This will permanently delete ${data?.count} expired opportunities, their eligibility lists, and all associated attachments from Cloudinary.\n\nAre you sure you want to proceed?`
    );

    if (!confirmed) return;

    try {
      setCleaning(true);
      const res = await fetch('/api/admin/cleanup-expired', {
        method: 'POST',
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(result.message || 'Cleanup completed successfully');
        loadPending();
      } else {
        throw new Error(result.error || 'Cleanup failed');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cleanup failed');
    } finally {
      setCleaning(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="p-6 rounded-xl border animate-pulse bg-white space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      </div>
    );
  }

  const count = data?.count ?? 0;
  const opps = data?.opportunities ?? [];

  return (
    <div className="admin-card rounded-xl p-6 border border-slate-200 bg-white">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Expired Data & Timeline Cleanup
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automatically or manually delete opportunities, attachments, and candidate lists past their retention window.
          </p>
        </div>

        {count > 0 && (
          <button
            onClick={handleCleanup}
            disabled={cleaning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            {cleaning ? 'Cleaning Up...' : `Run Cleanup (${count})`}
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="p-5 border border-dashed rounded-xl text-center text-sm text-slate-500 bg-slate-50/50">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          No expired opportunities require cleanup. All data is within retention guidelines.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Pending cleanup details</p>
              <p className="mt-0.5">
                The opportunities below have passed their deadlines and their retention periods. Running cleanup will permanently purge their database records, student eligibility lists, and Cloudinary attachments.
              </p>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-xl divide-y">
            {opps.map((opp) => {
              const fileCount = opp.attachments_json?.length ?? 0;
              return (
                <div key={opp.id} className="p-3.5 flex justify-between items-center text-xs hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">{opp.role}</p>
                    <p className="text-slate-500 mt-0.5">{opp.company}</p>
                  </div>
                  <div className="text-right text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3 h-3" />
                      Deadline: {new Date(opp.deadline).toLocaleDateString('en-IN')}
                    </p>
                    <p className="flex items-center gap-1.5 justify-end">
                      <FileText className="w-3 h-3" />
                      {opp.retention_days} days retention
                      {fileCount > 0 && ` • ${fileCount} file${fileCount > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
