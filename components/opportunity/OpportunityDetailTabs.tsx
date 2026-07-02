'use client';

import { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Calendar,
  Monitor,
  Users,
  Paperclip,
  ExternalLink,
  Phone,
  Download,
  Zap,
  IndianRupee,
} from 'lucide-react';

const TABS = [
  { id: 'overview',     label: 'Overview',       icon: <FileText className="w-4 h-4" /> },
  { id: 'eligibility',  label: 'Eligibility',    icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'roles',        label: 'Roles & Skills', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'process',      label: 'Selection',      icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'timeline',     label: 'Timeline',       icon: <Clock3 className="w-4 h-4" /> },
  { id: 'attachments',  label: 'Attachments',    icon: <Paperclip className="w-4 h-4" /> },
];

export function OpportunityDetailTabs({ data }: { data: any }) {
  const [tab, setTab] = useState('overview');

  // Filter out attachments tab if no attachments data
  const attachments = data.attachments_json || [];
  const hasDocLinks = data.jd_link || data.registration_link || data.source_link;
  const filteredTabs = TABS.filter(t => {
    if (t.id === 'attachments' && attachments.length === 0 && !hasDocLinks) return false;
    return true;
  });

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Tab headers */}
      <div className="flex flex-wrap md:flex-nowrap border-b border-border bg-muted/20 overflow-x-auto">
        {filteredTabs.map((t) => (
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
        {tab === 'attachments' && <AttachmentsTab data={data} />}
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

/* ─── Helper to get eligibility data from both flat and JSONB formats ─── */
function getEligibilityData(data: any) {
  const el = data.eligibility || {};
  const items: { label: string; value: string; icon: React.ReactNode }[] = [];

  // CGPA
  const cgpa = el.cgpa || el.minimum_cgpa_percentage;
  if (cgpa) items.push({ label: 'Minimum CGPA / Percentage', value: cgpa, icon: <GraduationCap className="w-4 h-4 text-blue-400" /> });

  // Education qualification
  const eduQual = el.educational_qualification || el.education_qualification || data.education_qualification;
  if (eduQual) items.push({ label: 'Educational Qualification', value: eduQual, icon: <GraduationCap className="w-4 h-4 text-indigo-400" /> });

  // Batch
  const batch = el.batch || el.passing_batch;
  if (batch) items.push({ label: 'Eligible Batch / Passing Year', value: batch, icon: <Clock3 className="w-4 h-4 text-green-400" /> });

  // Backlog
  const backlog = el.backlog || el.active_backlogs_allowed;
  if (backlog) items.push({ label: 'Backlogs Allowed', value: backlog, icon: <CheckCircle2 className="w-4 h-4 text-amber-400" /> });

  // Gender
  const gender = el.gender_eligibility || data.gender_eligibility;
  if (gender) items.push({ label: 'Gender Eligibility', value: gender, icon: <Users className="w-4 h-4 text-violet-400" /> });

  // Cutoff criteria
  if (el.cutoff_criteria) items.push({ label: 'Cutoff Criteria', value: el.cutoff_criteria, icon: <CheckCircle2 className="w-4 h-4 text-rose-400" /> });

  // Eligible streams
  const streams = el.eligible_streams || data.streams_specialization;
  if (streams) items.push({ label: 'Eligible Streams / Specialization', value: streams, icon: <Briefcase className="w-4 h-4 text-cyan-400" /> });

  // Eligible branches (string form, not the array)
  if (el.eligible_branches && typeof el.eligible_branches === 'string') {
    items.push({ label: 'Eligible Branches', value: el.eligible_branches, icon: <Briefcase className="w-4 h-4 text-teal-400" /> });
  }

  // Any additional eligibility keys
  const knownKeys = ['branches', 'cgpa', 'backlog', 'batch', 'other', 'minimum_cgpa_percentage', 'educational_qualification', 'education_qualification', 'passing_batch', 'active_backlogs_allowed', 'gender_eligibility', 'cutoff_criteria', 'eligible_branches', 'eligible_streams'];
  for (const [key, value] of Object.entries(el)) {
    if (!value || knownKeys.includes(key)) continue;
    if (typeof value === 'object') continue;
    items.push({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: String(value),
      icon: <CheckCircle2 className="w-4 h-4 text-purple-400" />,
    });
  }

  // Branches array
  const branches = el.branches;
  const branchArray = Array.isArray(branches) ? branches : [];

  // Other
  const other = el.other;

  return { items, branchArray, other };
}

function OverviewTab({ data }: { data: any }) {
  const content = data.instructions || data.raw_text;

  // Collect additional info items to display
  const additionalItems: { label: string; value: string; category: string }[] = [];

  // Venue, interview mode, work mode, employment type
  if (data.venue) additionalItems.push({ label: 'Venue', value: data.venue, category: 'logistics' });
  if (data.interview_mode) additionalItems.push({ label: 'Interview Mode', value: data.interview_mode, category: 'logistics' });
  if (data.joining_date) additionalItems.push({ label: 'Joining Date', value: data.joining_date, category: 'dates' });
  if (data.company_website) additionalItems.push({ label: 'Company Website', value: data.company_website, category: 'contact' });

  // Check eligibility JSONB for extra fields
  const el = data.eligibility || {};
  if (el.work_mode) additionalItems.push({ label: 'Work Mode', value: el.work_mode, category: 'logistics' });
  if (el.employment_type) additionalItems.push({ label: 'Employment Type', value: el.employment_type, category: 'logistics' });
  if (el.stipend) additionalItems.push({ label: 'Stipend', value: el.stipend, category: 'compensation' });
  if (el.communication_channel) additionalItems.push({ label: 'Communication Channel', value: el.communication_channel, category: 'contact' });
  if (el.check_inbox) additionalItems.push({ label: 'Check Inbox', value: el.check_inbox, category: 'instructions' });
  if (el.check_spam_folder) additionalItems.push({ label: 'Check Spam Folder', value: el.check_spam_folder, category: 'instructions' });
  if (el.timing_shared_by) additionalItems.push({ label: 'Timing Shared By', value: el.timing_shared_by, category: 'instructions' });
  if (el.issued_by) additionalItems.push({ label: 'Issued By', value: el.issued_by, category: 'other' });
  if (el.institution) additionalItems.push({ label: 'Institution', value: el.institution, category: 'other' });
  if (el.reminder_notice) additionalItems.push({ label: 'Reminder Notice', value: el.reminder_notice, category: 'other' });
  if (el.notice_type) additionalItems.push({ label: 'Notice Type', value: el.notice_type, category: 'other' });

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

      {/* Additional Details Grid */}
      {additionalItems.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Additional Details
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {additionalItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-xs text-muted-foreground font-medium min-w-[120px] pt-0.5 shrink-0">
                  {item.label}
                </span>
                <span className="text-sm font-medium break-words flex-1">
                  {renderTextWithLinks(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.source_link && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Source</p>
          <a
            href={data.source_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all inline-flex items-center gap-1"
          >
            {data.source_link}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      )}
    </div>
  );
}

function EligibilityTab({ data }: { data: any }) {
  const { items, branchArray, other } = getEligibilityData(data);

  if (items.length === 0 && branchArray.length === 0 && !other) {
    return <EmptyState text="No eligibility details available." />;
  }

  return (
    <div className="space-y-5">
      {items.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <EligibilityCard key={i} label={item.label} value={item.value} icon={item.icon} />
          ))}
        </div>
      )}

      {branchArray.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Eligible Branches
          </p>
          <div className="flex flex-wrap gap-2">
            {branchArray.map((b: string) => (
              <span key={b} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {other && (
        <div className="rounded-xl border p-4 bg-muted/20">
          <p className="text-sm font-semibold mb-2">Additional Requirements</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{other}</p>
        </div>
      )}
    </div>
  );
}

function RolesTab({ data }: { data: any }) {
  const hasSkills = data.skills && data.skills.length > 0;
  const hasResponsibilities = data.responsibilities && data.responsibilities.length > 0;
  const el = data.eligibility || {};

  // Extra job detail fields from JSONB
  const jobDetails: { label: string; value: string }[] = [];
  if (el.job_role && el.job_role !== data.role) jobDetails.push({ label: 'Detailed Role', value: el.job_role });
  if (el.salary_ctc && el.salary_ctc !== data.salary) jobDetails.push({ label: 'Salary / CTC', value: el.salary_ctc });
  if (el.stipend) jobDetails.push({ label: 'Stipend', value: el.stipend });
  if (el.work_mode) jobDetails.push({ label: 'Work Mode', value: el.work_mode });
  if (el.employment_type) jobDetails.push({ label: 'Employment Type', value: el.employment_type });

  if (!hasSkills && !hasResponsibilities && jobDetails.length === 0) {
    return <EmptyState text="No role or skills information provided." />;
  }

  return (
    <div className="space-y-6">
      {jobDetails.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" /> Job Details
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {jobDetails.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground font-medium min-w-[120px] pt-0.5 shrink-0">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
  const el = data.eligibility || {};

  // Recruitment process fields from JSONB
  const processDetails: { label: string; value: string }[] = [];
  if (el.hiring_process) processDetails.push({ label: 'Hiring Process', value: el.hiring_process });
  if (el.number_of_rounds) processDetails.push({ label: 'Number of Rounds', value: el.number_of_rounds });
  if (el.elimination_rounds) processDetails.push({ label: 'Elimination Rounds', value: el.elimination_rounds });

  const hasProc = proc && (proc.rounds || proc.description?.length > 0);
  const hasDetails = processDetails.length > 0;

  if (!hasProc && !hasDetails) {
    return <EmptyState text="No selection process information provided." />;
  }

  return (
    <div className="space-y-5">
      {hasDetails && (
        <div className="grid md:grid-cols-2 gap-3">
          {processDetails.map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-3 px-4 rounded-xl border bg-muted/20">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium whitespace-pre-wrap">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {proc?.rounds && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {proc.rounds} Round{proc.rounds > 1 ? 's' : ''}
        </div>
      )}

      {proc?.description?.length > 0 && (
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
  const el = data.eligibility || {};
  
  const events = [
    data.notice_posted_at && { label: 'Notice Posted', date: data.notice_posted_at, color: 'bg-blue-500' },
    el.event_date && { label: 'Event Date', date: el.event_date, color: 'bg-indigo-500' },
    data.deadline && { label: 'Application Deadline', date: data.deadline, color: 'bg-amber-500' },
    data.joining_date && { label: 'Expected Joining', date: data.joining_date, color: 'bg-green-500' },
  ].filter(Boolean) as { label: string; date: string; color: string }[];

  // Schedule details from JSONB
  const scheduleDetails: { label: string; value: string }[] = [];
  if (el.event_date) scheduleDetails.push({ label: 'Event Date', value: el.event_date });
  if (el.time) scheduleDetails.push({ label: 'Time', value: el.time });
  if (el.venue || data.venue) scheduleDetails.push({ label: 'Venue', value: el.venue || data.venue });
  if (el.mode || data.interview_mode) scheduleDetails.push({ label: 'Mode', value: el.mode || data.interview_mode });

  if (events.length === 0 && scheduleDetails.length === 0) {
    return <EmptyState text="No timeline information available." />;
  }

  return (
    <div className="space-y-6">
      {events.length > 0 && (
        <div className="space-y-4">
          {events.map((ev, i) => {
            const parsed = new Date(ev.date);
            const isValidDate = !isNaN(parsed.getTime());
            return (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full ${ev.color} mt-1.5 shrink-0`} />
                <div>
                  <p className="font-medium text-sm">{ev.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isValidDate
                      ? parsed.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : ev.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {scheduleDetails.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Schedule Details
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {scheduleDetails.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground font-medium min-w-[80px] pt-0.5 shrink-0">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AttachmentsTab({ data }: { data: any }) {
  const attachments = data.attachments_json || [];
  const docLinks: { label: string; url: string }[] = [];

  if (data.jd_link) docLinks.push({ label: 'Job Description', url: data.jd_link });
  if (data.registration_link) docLinks.push({ label: 'Registration Link', url: data.registration_link });
  if (data.source_link) docLinks.push({ label: 'Source Notice', url: data.source_link });
  if (data.apply_link) docLinks.push({ label: 'Apply Link', url: data.apply_link });

  // Check eligibility JSONB for doc links
  const el = data.eligibility || {};
  if (el.student_eligible_list) docLinks.push({ label: 'Student Eligible List', url: el.student_eligible_list });
  if (el.additional_documents) docLinks.push({ label: 'Additional Documents', url: el.additional_documents });

  if (attachments.length === 0 && docLinks.length === 0) {
    return <EmptyState text="No attachments or documents available." />;
  }

  const fileTypeIcons: Record<string, string> = {
    pdf: '📄',
    eligibility_list: '📊',
    document: '📝',
    image: '🖼️',
    other: '📎',
  };

  return (
    <div className="space-y-6">
      {/* Uploaded Attachments */}
      {attachments.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary" /> Uploaded Files
          </h3>
          <div className="space-y-2">
            {attachments.map((att: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                <span className="text-lg">{fileTypeIcons[att.file_type] || '📎'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{att.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {att.file_type?.replace('_', ' ')}
                    {att.file_size ? ` • ${(att.file_size / 1024).toFixed(0)} KB` : ''}
                  </p>
                </div>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Links */}
      {docLinks.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" /> Document Links
          </h3>
          <div className="space-y-2">
            {docLinks.map((doc, i) => (
              <a
                key={i}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border hover:border-primary/30 hover:bg-accent transition-all group"
              >
                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{doc.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{doc.url}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
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
