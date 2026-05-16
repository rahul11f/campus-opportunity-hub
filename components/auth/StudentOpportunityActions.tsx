'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Bookmark,
  ExternalLink,
  CheckCircle2,
  SearchCheck,
} from 'lucide-react';

interface Props {
  opportunityId: string;
  applyLink?: string | null;
}

export function StudentOpportunityActions({
  opportunityId,
  applyLink,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [checking, setChecking] = useState(false);

  async function saveOpportunity() {
    try {
      setSaving(true);

      const res = await fetch('/api/student/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId,
        }),
      });

      if (!res.ok) {
        toast.error(
          'Please login as student first'
        );
        return;
      }

      toast.success('Opportunity saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function markApplied() {
    try {
      setApplying(true);

      const res = await fetch('/api/student/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId,
        }),
      });

      if (!res.ok) {
        toast.error(
          'Please login as student first'
        );
        return;
      }

      toast.success('Application tracked');

      if (applyLink) {
        window.open(applyLink, '_blank');
      }
    } catch {
      toast.error('Tracking failed');
    } finally {
      setApplying(false);
    }
  }

  async function checkEligibility() {
    try {
      setChecking(true);

      const res = await fetch(
        '/api/student/eligibility',
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

      const data = await res.json();

      if (data.eligible) {
        toast.success(
          `Eligible: ${data.candidate?.name || 'Matched'}`
        );
      } else {
        toast.error(
          data.reason ||
            'Not eligible / list unavailable'
        );
      }
    } catch {
      toast.error(
        'Eligibility check failed'
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={saveOpportunity}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border font-medium hover:bg-accent"
      >
        <Bookmark className="w-4 h-4" />
        {saving
          ? 'Saving...'
          : 'Save Opportunity'}
      </button>

      <button
        onClick={checkEligibility}
        disabled={checking}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border font-medium hover:bg-accent"
      >
        <SearchCheck className="w-4 h-4" />
        {checking
          ? 'Checking...'
          : 'Check Eligibility'}
      </button>

      <button
        onClick={markApplied}
        disabled={applying}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90"
      >
        <ExternalLink className="w-4 h-4" />
        {applying
          ? 'Processing...'
          : 'Apply + Track'}
      </button>
    </div>
  );
}
