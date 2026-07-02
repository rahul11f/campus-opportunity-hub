'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Search, User, Hash, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

type CandidateResult = {
  student_name: string | null;
  father_name: string | null;
  university_roll_no: string | null;
  course: string | null;
  branch: string | null;
  batch: string | null;
  backlogs: string | null;
  eligible: boolean;
  raw_row: Record<string, unknown> | null;
};

export function EligibilityChecker({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [profileResult, setProfileResult] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showListChecker, setShowListChecker] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);

  // Existing profile-based check
  async function checkProfile() {
    setProfileLoading(true);
    const res = await fetch('/api/student/eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId }),
    });
    const data = await res.json();
    setProfileResult(data);
    setProfileLoading(false);
  }

  // New: check against uploaded eligibility list
  async function checkFromList() {
    if (!rollNo.trim() && !name.trim() && !branch.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/student/check-eligibility-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId,
          rollNo: rollNo.trim() || undefined,
          name: name.trim() || undefined,
          branch: branch.trim() || undefined,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to check eligibility' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-5">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        Check Eligibility
      </h3>

      {/* Profile-based quick check */}
      <div>
        <button
          onClick={checkProfile}
          disabled={profileLoading}
          className="w-full px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {profileLoading ? 'Checking...' : 'Quick Check (My Profile)'}
        </button>

        {profileResult && (
          <div className="mt-3 p-3 rounded-xl border bg-muted/20">
            <div className="flex items-center gap-2">
              {profileResult.eligible ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold text-sm">
                {profileResult.eligible ? 'You are eligible!' : 'Not eligible'}
              </span>
            </div>

            {profileResult.reasons?.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {profileResult.reasons.map((r: string, i: number) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Eligibility List Checker */}
      <div>
        <button
          onClick={() => setShowListChecker(!showListChecker)}
          className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            Check from Eligibility List
          </span>
          {showListChecker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showListChecker && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Search by roll number, name, or branch to check if you&apos;re in the eligibility list.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="Roll Number"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Student Name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Branch"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              onClick={checkFromList}
              disabled={loading || (!rollNo.trim() && !name.trim() && !branch.trim())}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/30 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search Eligibility List'}
            </button>

            {/* Results */}
            {result && (
              <div className="space-y-2">
                {result.error ? (
                  <div className="p-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
                  </div>
                ) : result.totalCandidates === 0 ? (
                  <div className="p-3 rounded-xl border bg-muted/20">
                    <p className="text-sm text-muted-foreground">No eligibility list has been uploaded for this opportunity yet.</p>
                  </div>
                ) : !result.found ? (
                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        No matching record found
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Searched in {result.totalCandidates} records. Try different search criteria.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Found {result.candidates.length} matching record{result.candidates.length > 1 ? 's' : ''}
                    </div>

                    {result.candidates.map((candidate: CandidateResult, i: number) => (
                      <div key={i} className="rounded-xl border bg-muted/10 overflow-hidden">
                        <button
                          onClick={() => setExpandedCandidate(expandedCandidate === i ? null : i)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {candidate.eligible ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{candidate.student_name || candidate.university_roll_no || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">
                                {[candidate.branch, candidate.batch, candidate.course].filter(Boolean).join(' • ')}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            candidate.eligible
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {candidate.eligible ? 'Eligible' : 'Not Eligible'}
                          </span>
                        </button>

                        {expandedCandidate === i && (
                          <div className="px-4 pb-3 border-t border-border/50 pt-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {candidate.student_name && (
                                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{candidate.student_name}</span></div>
                              )}
                              {candidate.father_name && (
                                <div><span className="text-muted-foreground">Father:</span> <span className="font-medium">{candidate.father_name}</span></div>
                              )}
                              {candidate.university_roll_no && (
                                <div><span className="text-muted-foreground">Roll No:</span> <span className="font-medium">{candidate.university_roll_no}</span></div>
                              )}
                              {candidate.course && (
                                <div><span className="text-muted-foreground">Course:</span> <span className="font-medium">{candidate.course}</span></div>
                              )}
                              {candidate.branch && (
                                <div><span className="text-muted-foreground">Branch:</span> <span className="font-medium">{candidate.branch}</span></div>
                              )}
                              {candidate.batch && (
                                <div><span className="text-muted-foreground">Batch:</span> <span className="font-medium">{candidate.batch}</span></div>
                              )}
                              {candidate.backlogs && (
                                <div><span className="text-muted-foreground">Backlogs:</span> <span className="font-medium">{candidate.backlogs}</span></div>
                              )}
                            </div>

                            {/* Show raw row data if available */}
                            {candidate.raw_row && Object.keys(candidate.raw_row).length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border/30">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">All Fields</p>
                                <div className="grid grid-cols-2 gap-1 text-[10px]">
                                  {Object.entries(candidate.raw_row).map(([key, val]) => (
                                    <div key={key} className="truncate">
                                      <span className="text-muted-foreground">{key}:</span>{' '}
                                      <span className="font-medium">{String(val ?? '')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}