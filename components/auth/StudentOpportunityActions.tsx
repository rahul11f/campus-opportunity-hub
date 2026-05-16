'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Bookmark,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export function StudentOpportunityActions({
  opportunityId,
  applyLink,
}: {
  opportunityId: string;
  applyLink?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  async function saveOpportunity() {
    try {
      setSaving(true);

      const res = await fetch(
        '/api/student/save',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            opportunityId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      setSaved(true);
      toast.success('Saved successfully');
    } catch {
      toast.error('Login required to save');
    } finally {
      setSaving(false);
    }
  }

  async function applyOpportunity() {
    try {
      setApplying(true);

      const res = await fetch(
        '/api/student/apply',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            opportunityId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      setApplied(true);

      toast.success('Application tracked');

      if (applyLink) {
        window.open(
          applyLink,
          '_blank'
        );
      }
    } catch {
      toast.error('Login required');
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={saveOpportunity}
        disabled={saving || saved}
        className="px-5 py-3 rounded-2xl border font-medium flex items-center gap-2"
      >
        <Bookmark className="w-4 h-4" />

        {saved
          ? 'Saved'
          : saving
          ? 'Saving...'
          : 'Save'}
      </button>

      <button
        onClick={applyOpportunity}
        disabled={applying || applied}
        className="px-5 py-3 rounded-2xl bg-primary text-white font-medium flex items-center gap-2"
      >
        {applied ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <ExternalLink className="w-4 h-4" />
        )}

        {applied
          ? 'Applied'
          : applying
          ? 'Applying...'
          : 'Apply'}
      </button>
    </div>
  );
}