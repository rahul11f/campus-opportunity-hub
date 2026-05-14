'use client';

import { useState } from 'react';

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
        alert('Please login as student first');
        return;
      }

      alert('Opportunity saved');
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
        alert('Please login as student first');
        return;
      }

      if (applyLink) {
        window.open(applyLink, '_blank');
      }

      alert('Application tracked');
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={saveOpportunity}
        disabled={saving}
        className="px-5 py-3 rounded-xl border border-border font-medium hover:bg-accent transition-colors"
      >
        {saving ? 'Saving...' : 'Save Opportunity'}
      </button>

      <button
        onClick={markApplied}
        disabled={applying}
        className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
      >
        {applying ? 'Processing...' : 'Apply + Track'}
      </button>
    </div>
  );
}
