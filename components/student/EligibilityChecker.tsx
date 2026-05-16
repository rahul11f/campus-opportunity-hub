'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export function EligibilityChecker({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);

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
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="rounded-3xl border bg-card p-6 space-y-4">
      <button
        onClick={check}
        disabled={loading}
        className="px-6 py-4 rounded-2xl bg-primary text-white font-semibold"
      >
        {loading
          ? 'Checking...'
          : 'Check My Eligibility'}
      </button>

      {result && (
        <div>
          <div className="flex items-center gap-2">
            {result.eligible ? (
              <CheckCircle2 className="text-green-400" />
            ) : (
              <XCircle className="text-red-400" />
            )}

            <span className="font-semibold">
              {result.eligible
                ? 'You are eligible'
                : 'Not eligible'}
            </span>
          </div>

          {result.reasons?.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {result.reasons.map(
                (r: string, i: number) => (
                  <li key={i}>
                    • {r}
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}