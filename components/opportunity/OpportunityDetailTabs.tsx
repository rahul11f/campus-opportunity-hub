'use client';

import { useState } from 'react';
import { GraduationCap, Briefcase, CheckCircle2, IndianRupee, Clock3, FileText } from 'lucide-react';

const TABS = [
  { id: 'overview',   label: 'Overview',    icon: <FileText className="w-4 h-4" /> },
  { id: 'eligibility',label: 'Eligibility', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'roles',      label: 'Roles & Skills', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'process',    label: 'Selection',   icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'timeline',   label: 'Timeline',    icon: <Clock3 className="w-4 h-4" /> },
];

export function OpportunityDetailTabs({ data }: { data: any }) {
  const [tab, setTab] = useState('overview');

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Tab headers */}
      <div className="flex flex-wrap md:flex-nowrap border-b border-border bg-muted/20">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
              tab === t.id
                ? 'border-primary text-foreground bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 md:p-8">
        {tab === 'overview' && <OverviewTab data={data} />}
        {tab === 'eligibility' && <EligibilityTab data={data} />}
        {tab === 'roles' && <RolesTab data={data} />}
        {tab === 'process' && <ProcessTab data={data} />}
        {tab === 'timeline' && <TimelineTab data={data} />}
      </div>
    </div>
  );
}

function renderTextWithLinks(text: string) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium break-all">
          {part}
        </a>
      );
    }
    return part;
  });
}

function OverviewTab({ data }: { data: any }) {
  const content = data.instructions || data.raw_text;
  return (
    <div className="space-y-6">
      {content ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed text-sm text-foreground">
            {renderTextWithLinks(content)}
          </div>
        </div>
      ) : (
        <EmptyState text="No overview information available for this opportunity." />
      )}

      {data.source_link && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Source</p>
          <a
            href={data.source_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {data.source_link}
          </a>
        </div>
      )}
    </div>
  );
}

function EligibilityTab({ data }: { data: any }) {
  const el = data.eligibility;
  if (!el) return <EmptyState text="No eligibility details available." />;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        {el.cgpa && (
          <EligibilityCard
            label="Minimum CGPA"
            value={el.cgpa}
            icon={<GraduationCap className="w-4 h-4 text-blue-400" />}
          />
        )}
        {el.batch && (
          <EligibilityCard
            label="Eligible Batch"
            value={el.batch}
            icon={<Clock3 className="w-4 h-4 text-green-400" />}
          />
        )}
        {el.backlog !== undefined && (
          <EligibilityCard
            label="Backlog Allowed"
            value={el.backlog || 'No backlogs'}
            icon={<CheckCircle2 className="w-4 h-4 text-amber-400" />}
          />
        )}
        {data.gender_eligibility && (
          <EligibilityCard
            label="Gender"
            value={data.gender_eligibility}
            icon={<GraduationCap className="w-4 h-4 text-violet-400" />}
          />
        )}
        {Object.entries(el).map(([key, value]) => {
          if (!value || ['branches', 'cgpa', 'backlog', 'batch', 'other'].includes(key)) return null;
          return (
            <EligibilityCard
              key={key}
              label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              value={String(value)}
              icon={<CheckCircle2 className="w-4 h-4 text-purple-400" />}
            />
          );
        })}
      </div>

      {el.branches && el.branches.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Eligible Branches
          </p>
          <div className="flex flex-wrap gap-2">
            {el.branches.map((b: string) => (
              <span key={b} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {el.other && (
        <div className="rounded-xl border p-4 bg-muted/20">
          <p className="text-sm font-semibold mb-2">Additional Requirements</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{el.other}</p>
        </div>
      )}
    </div>
  );
}

function RolesTab({ data }: { data: any }) {
  const hasSkills = data.skills && data.skills.length > 0;
  const hasResponsibilities = data.responsibilities && data.responsibilities.length > 0;

  if (!hasSkills && !hasResponsibilities) {
    return <EmptyState text="No role or skills information provided." />;
  }

  return (
    <div className="space-y-6">
      {hasSkills && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Required Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s: string, i: number) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium border border-blue-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasResponsibilities && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" /> Key Responsibilities
          </h3>
          <ul className="space-y-2">
            {data.responsibilities.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProcessTab({ data }: { data: any }) {
  const proc = data.interview_process;
  if (!proc || (!proc.rounds && !proc.description?.length)) {
    return <EmptyState text="No selection process information provided." />;
  }

  return (
    <div className="space-y-5">
      {proc.rounds && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {proc.rounds} Round{proc.rounds > 1 ? 's' : ''}
        </div>
      )}

      {proc.description?.length > 0 && (
        <div className="space-y-3">
          {proc.description.map((step: string, i: number) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border bg-muted/20">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-foreground mt-0.5">{step}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineTab({ data }: { data: any }) {
  const events = [
    data.notice_posted_at && { label: 'Notice Posted', date: data.notice_posted_at, color: 'bg-blue-500' },
    data.deadline && { label: 'Application Deadline', date: data.deadline, color: 'bg-amber-500' },
    data.joining_date && { label: 'Expected Joining', date: data.joining_date, color: 'bg-green-500' },
  ].filter(Boolean) as { label: string; date: string; color: string }[];

  if (events.length === 0) return <EmptyState text="No timeline information available." />;

  return (
    <div className="space-y-4">
      {events.map((ev, i) => (
        <div key={i} className="flex items-start gap-4">
          <div className={`w-3 h-3 rounded-full ${ev.color} mt-1.5 shrink-0`} />
          <div>
            <p className="font-medium text-sm">{ev.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(ev.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EligibilityCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4 bg-muted/20 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-10 text-muted-foreground">
      <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
