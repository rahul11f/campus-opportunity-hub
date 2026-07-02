'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users2,
  Calendar,
  MessageSquare,
  Paperclip,
  FileText,
  Sparkles,
  Code2,
  Phone,
  MapPin,
  FileCheck,
  Clock,
  Wallet,
  HelpCircle,
  ExternalLink,
  BarChart3,
  PlusCircle,
  X,
  Edit2,
  Check,
  IndianRupee,
  Building2,
} from 'lucide-react';
import { OpportunityCard } from '@/components/opportunity/OpportunityCard';
import { OpportunityDetailTabs } from '@/components/opportunity/OpportunityDetailTabs';

/* ─── Types ────────────────────────────────────────── */

type AdditionalInfoItem = {
  label: string;
  category: string;
  value: string;
};

type ExtractionData = Record<string, unknown> & {
  additional_extracted_info?: AdditionalInfoItem[];
  confidence_score?: number;
  opportunities?: ExtractionData[];
};

type ExtractionStats = {
  populated_sections?: string[];
  populated_field_count?: number;
  additional_info_count?: number;
};

type Props = {
  data: ExtractionData;
  stats?: ExtractionStats | null;
  onSelectOpportunity?: (index: number) => void;
  selectedOpportunityIndex?: number;
  onDataChange?: (newData: ExtractionData) => void;
};

/* ─── Section metadata ─────────────────────────────── */

const SECTION_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  basic_information: {
    label: 'Basic Information',
    icon: <ShieldCheck className="w-4 h-4" />,
    color: 'text-emerald-500',
  },
  eligibility: {
    label: 'Eligibility Criteria',
    icon: <GraduationCap className="w-4 h-4" />,
    color: 'text-blue-500',
  },
  job_details: {
    label: 'Job Details',
    icon: <Briefcase className="w-4 h-4" />,
    color: 'text-cyan-500',
  },
  recruitment_process: {
    label: 'Recruitment Process',
    icon: <Users2 className="w-4 h-4" />,
    color: 'text-amber-500',
  },
  schedule: {
    label: 'Schedule & Timing',
    icon: <Calendar className="w-4 h-4" />,
    color: 'text-pink-500',
  },
  communication: {
    label: 'Communication',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-violet-500',
  },
  attachments: {
    label: 'Attachments & Resources',
    icon: <Paperclip className="w-4 h-4" />,
    color: 'text-orange-500',
  },
  source_metadata: {
    label: 'Source Metadata',
    icon: <FileText className="w-4 h-4" />,
    color: 'text-slate-500',
  },
};

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ReactNode; bgClass: string; textClass: string }
> = {
  instructions: {
    label: 'Instructions',
    icon: <FileCheck className="w-3.5 h-3.5" />,
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  contact: {
    label: 'Contact Details',
    icon: <Phone className="w-3.5 h-3.5" />,
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
  },
  logistics: {
    label: 'Logistics',
    icon: <MapPin className="w-3.5 h-3.5" />,
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  documents: {
    label: 'Documents',
    icon: <FileText className="w-3.5 h-3.5" />,
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-300',
  },
  dates: {
    label: 'Important Dates',
    icon: <Clock className="w-3.5 h-3.5" />,
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
    textClass: 'text-pink-700 dark:text-pink-300',
  },
  compensation: {
    label: 'Compensation',
    icon: <Wallet className="w-3.5 h-3.5" />,
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  eligibility: {
    label: 'Eligibility',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
    textClass: 'text-cyan-700 dark:text-cyan-300',
  },
  other: {
    label: 'Other Details',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    bgClass: 'bg-slate-100 dark:bg-slate-800/50',
    textClass: 'text-slate-700 dark:text-slate-300',
  },
};

/* ─── Helpers ──────────────────────────────────────── */

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function isUrl(str: string): boolean {
  return /^https?:\/\//i.test(str);
}

function renderValue(value: string) {
  if (isUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all inline-flex items-center gap-1"
      >
        {value.length > 60 ? value.substring(0, 60) + '...' : value}
        <ExternalLink className="w-3 h-3 shrink-0" />
      </a>
    );
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = value.split(urlRegex);

  if (parts.length === 1) {
    return <span className="text-foreground">{value}</span>;
  }

  return (
    <span className="text-foreground">
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

/* ─── Sub-components ───────────────────────────────── */

function SummaryBar({
  data,
  stats,
}: {
  data: ExtractionData;
  stats?: ExtractionStats | null;
}) {
  const fieldCount = stats?.populated_field_count ?? 0;
  const sectionCount = stats?.populated_sections?.length ?? 0;
  const additionalCount = stats?.additional_info_count ?? 0;
  const confidence = data.confidence_score;

  return (
    <div className="rounded-xl border border-border bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-bold text-foreground">Extraction Summary</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{fieldCount}</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Fields Extracted</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{sectionCount}</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Active Sections</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{additionalCount}</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Additional Details</div>
        </div>
        {typeof confidence === 'number' && (
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              confidence >= 0.8 ? 'text-emerald-600 dark:text-emerald-400' :
              confidence >= 0.5 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {Math.round(confidence * 100)}%
            </div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Confidence</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  sectionKey,
  fields,
}: {
  sectionKey: string;
  fields: Record<string, string>;
}) {
  const [open, setOpen] = useState(true);
  const meta = SECTION_META[sectionKey];

  if (!meta) return null;

  const fieldCount = Object.keys(fields).length;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={meta.color}>{meta.icon}</span>
          <span className="font-semibold text-sm text-foreground">{meta.label}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="grid grid-cols-1 gap-2.5 mt-3">
            {Object.entries(fields).map(([key, value]) => (
              <div
                key={key}
                className="flex items-start gap-3 py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground font-medium min-w-[140px] pt-0.5 shrink-0">
                  {humanizeKey(key)}
                </span>
                <span className="text-sm font-medium break-words flex-1">
                  {renderValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdditionalInfoSection({
  items,
  onAddDetail,
}: {
  items: AdditionalInfoItem[];
  onAddDetail?: (label: string, value: string, category: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState('other');

  const grouped: Record<string, AdditionalInfoItem[]> = {};
  for (const item of items) {
    const cat = item.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Additional Extracted Details</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-primary/20 space-y-4 mt-3">
          {Object.entries(grouped).map(([category, catItems]) => {
            const catMeta = CATEGORY_META[category] || CATEGORY_META.other;

            return (
              <div key={category}>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mb-2 ${catMeta.bgClass} ${catMeta.textClass}`}>
                  {catMeta.icon}
                  {catMeta.label}
                </div>

                <div className="space-y-1.5">
                  {catItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 py-2 px-3 rounded-lg bg-background border border-border/50 hover:border-border transition-colors"
                    >
                      <span className="text-xs text-muted-foreground font-medium min-w-[140px] pt-0.5 shrink-0">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium break-words flex-1">
                        {renderValue(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {onAddDetail && (
            <div className="pt-3 border-t border-primary/20 mt-4">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5 text-primary" /> Add Custom Detail / Slot
              </p>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Bond, Dress Code)"
                  className="flex-1 bg-white dark:bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 2 Years, Formals)"
                  className="flex-[2] bg-white dark:bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
                <select
                  className="bg-white dark:bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="other">Other</option>
                  <option value="instructions">Instructions</option>
                  <option value="contact">Contact</option>
                  <option value="logistics">Logistics</option>
                  <option value="documents">Documents</option>
                  <option value="dates">Dates</option>
                  <option value="compensation">Compensation</option>
                  <option value="eligibility">Eligibility</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (newLabel.trim() && newValue.trim()) {
                      onAddDetail(newLabel.trim(), newValue.trim(), newCategory);
                      setNewLabel('');
                      setNewValue('');
                    }
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  Add Slot
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function createPreviewOpportunity(opp: any) {
  if (!opp) return null;
  
  // Resolve eligibility structure
  const el = opp.eligibility || {};
  const branches = Array.isArray(el.branches)
    ? el.branches
    : el.eligible_branches
    ? [el.eligible_branches]
    : [];

  return {
    ...opp,
    company: opp.company || opp.basic_information?.company_name || 'Company Name',
    role: opp.role || opp.job_details?.job_role || 'Job Role',
    type: opp.type || opp.basic_information?.opportunity_type || 'placement',
    salary: opp.salary || opp.job_details?.salary_ctc || null,
    location: opp.location || opp.job_details?.location || null,
    deadline: opp.deadline || opp.basic_information?.application_deadline || null,
    company_website: opp.company_website || opp.basic_information?.company_website || opp.website || null,
    instructions: opp.instructions || opp.communication?.additional_instructions || opp.additional_instructions || null,
    apply_link: opp.apply_link || opp.basic_information?.jd_link || opp.attachments?.jd_link || null,
    source_link: opp.source_link || null,
    company_logo: opp.company_logo || opp.basic_information?.company_logo || null,
    skills: opp.skills || [],
    responsibilities: opp.responsibilities || [],
    eligibility: {
      ...el,
      cgpa: el.cgpa || el.minimum_cgpa_percentage || null,
      branches: branches,
      batch: el.batch || el.passing_batch || null,
      backlog: el.backlog || el.active_backlogs_allowed || null,
    }
  };
}

function getOpportunityFields(opp: any) {
  const fields: Record<string, string> = {};

  // Basic info
  fields.company = opp.company || opp.basic_information?.company_name || '';
  fields.role = opp.role || opp.job_details?.job_role || '';
  fields.type = opp.type || opp.basic_information?.opportunity_type || 'placement';
  fields.salary = opp.salary || opp.job_details?.salary_ctc || '';
  fields.location = opp.location || opp.job_details?.location || '';
  fields.apply_link = opp.apply_link || opp.basic_information?.jd_link || opp.attachments?.jd_link || '';
  fields.source_link = opp.source_link || '';
  fields.instructions = opp.instructions || opp.communication?.additional_instructions || '';
  fields.deadline = opp.deadline || opp.basic_information?.application_deadline || '';

  // Eligibility
  fields.cgpa = opp.eligibility?.cgpa || opp.eligibility?.minimum_cgpa_percentage || '';
  fields.backlog = opp.eligibility?.backlog || opp.eligibility?.active_backlogs_allowed || '';
  fields.batch = opp.eligibility?.batch || opp.eligibility?.passing_batch || '';
  fields.branches = Array.isArray(opp.eligibility?.branches)
    ? opp.eligibility.branches.join(', ')
    : opp.eligibility?.branches || opp.eligibility?.eligible_branches || '';
  fields.educational_qualification = opp.eligibility?.educational_qualification || opp.eligibility?.education_qualification || '';
  fields.eligible_streams = opp.eligibility?.eligible_streams || '';
  fields.cutoff_criteria = opp.eligibility?.cutoff_criteria || '';
  fields.gender_eligibility = opp.eligibility?.gender_eligibility || '';

  // Job details
  fields.stipend = opp.job_details?.stipend || opp.eligibility?.stipend || '';
  fields.work_mode = opp.job_details?.work_mode || opp.eligibility?.work_mode || '';
  fields.employment_type = opp.job_details?.employment_type || opp.eligibility?.employment_type || '';

  // Recruitment process
  fields.hiring_process = opp.recruitment_process?.hiring_process || opp.eligibility?.hiring_process || '';
  fields.number_of_rounds = opp.recruitment_process?.number_of_rounds || opp.eligibility?.number_of_rounds || '';
  fields.elimination_rounds = opp.recruitment_process?.elimination_rounds || opp.eligibility?.elimination_rounds || '';

  // Schedule
  fields.event_date = opp.schedule?.event_date || opp.eligibility?.event_date || '';
  fields.time = opp.schedule?.time || opp.eligibility?.time || '';
  fields.venue = opp.schedule?.venue || opp.eligibility?.venue || '';
  fields.mode = opp.schedule?.mode || opp.eligibility?.mode || '';

  // Communication
  fields.communication_channel = opp.communication?.communication_channel || opp.eligibility?.communication_channel || '';
  fields.check_inbox = opp.communication?.check_inbox || opp.eligibility?.check_inbox || '';
  fields.check_spam_folder = opp.communication?.check_spam_folder || opp.eligibility?.check_spam_folder || '';
  fields.timing_shared_by = opp.communication?.timing_shared_by || opp.eligibility?.timing_shared_by || '';

  // Attachments
  fields.student_eligible_list = opp.attachments?.student_eligible_list || opp.eligibility?.student_eligible_list || '';
  fields.additional_documents = opp.attachments?.additional_documents || opp.eligibility?.additional_documents || '';

  // Source metadata
  fields.issued_by = opp.source_metadata?.issued_by || opp.eligibility?.issued_by || '';
  fields.institution = opp.source_metadata?.institution || opp.eligibility?.institution || '';
  fields.reminder_notice = opp.source_metadata?.reminder_notice || opp.eligibility?.reminder_notice || '';
  fields.notice_type = opp.source_metadata?.notice_type || opp.eligibility?.notice_type || '';

  // Company logo
  fields.company_logo = opp.basic_information?.company_logo || opp.eligibility?.company_logo || '';
  fields.round_name = opp.basic_information?.round_name || opp.eligibility?.round_name || '';

  return fields;
}

// Group field definitions for the edit form sections
const EDIT_SECTIONS: { key: string; label: string; fields: { key: string; label: string; type?: string }[] }[] = [
  {
    key: 'basic',
    label: 'Basic Information',
    fields: [
      { key: 'company', label: 'Company Name' },
      { key: 'role', label: 'Job Role' },
      { key: 'type', label: 'Opportunity Type' },
      { key: 'salary', label: 'Salary / CTC' },
      { key: 'location', label: 'Location' },
      { key: 'deadline', label: 'Application Deadline', type: 'datetime-local' },
      { key: 'apply_link', label: 'Apply / JD Link' },
      { key: 'source_link', label: 'Source Link' },
      { key: 'company_logo', label: 'Company Logo URL' },
      { key: 'round_name', label: 'Round Name' },
    ],
  },
  {
    key: 'eligibility',
    label: 'Eligibility Criteria',
    fields: [
      { key: 'cgpa', label: 'Minimum CGPA / Percentage' },
      { key: 'backlog', label: 'Backlogs Allowed' },
      { key: 'batch', label: 'Eligible Batch / Passing Year' },
      { key: 'branches', label: 'Eligible Branches (comma separated)' },
      { key: 'educational_qualification', label: 'Educational Qualification' },
      { key: 'eligible_streams', label: 'Eligible Streams' },
      { key: 'cutoff_criteria', label: 'Cutoff Criteria' },
      { key: 'gender_eligibility', label: 'Gender Eligibility' },
    ],
  },
  {
    key: 'job_details',
    label: 'Job Details',
    fields: [
      { key: 'stipend', label: 'Stipend' },
      { key: 'work_mode', label: 'Work Mode' },
      { key: 'employment_type', label: 'Employment Type' },
    ],
  },
  {
    key: 'recruitment',
    label: 'Recruitment Process',
    fields: [
      { key: 'hiring_process', label: 'Hiring Process' },
      { key: 'number_of_rounds', label: 'Number of Rounds' },
      { key: 'elimination_rounds', label: 'Elimination Rounds' },
    ],
  },
  {
    key: 'schedule',
    label: 'Schedule & Timing',
    fields: [
      { key: 'event_date', label: 'Event Date' },
      { key: 'time', label: 'Time' },
      { key: 'venue', label: 'Venue' },
      { key: 'mode', label: 'Mode (Online/Offline)' },
    ],
  },
  {
    key: 'communication',
    label: 'Communication',
    fields: [
      { key: 'communication_channel', label: 'Communication Channel' },
      { key: 'check_inbox', label: 'Check Inbox' },
      { key: 'check_spam_folder', label: 'Check Spam Folder' },
      { key: 'timing_shared_by', label: 'Timing Shared By' },
    ],
  },
  {
    key: 'attachments_links',
    label: 'Attachments & Resources',
    fields: [
      { key: 'student_eligible_list', label: 'Student Eligible List URL' },
      { key: 'additional_documents', label: 'Additional Documents URL' },
    ],
  },
  {
    key: 'source',
    label: 'Source Metadata',
    fields: [
      { key: 'issued_by', label: 'Issued By' },
      { key: 'institution', label: 'Institution' },
      { key: 'reminder_notice', label: 'Reminder Notice' },
      { key: 'notice_type', label: 'Notice Type' },
    ],
  },
  {
    key: 'content',
    label: 'Notice Instructions',
    fields: [
      { key: 'instructions', label: 'Instructions / Notice Content', type: 'textarea' },
    ],
  },
];

function updateOpportunityFields(opp: any, fields: Record<string, string>) {
  const branchesArray = fields.branches
    ? fields.branches.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const isNested = !!(opp.basic_information || opp.job_details);

  if (isNested) {
    return {
      ...opp,
      basic_information: {
        ...opp.basic_information,
        company_name: fields.company,
        opportunity_type: fields.type,
        application_deadline: fields.deadline,
        jd_link: fields.apply_link,
        company_logo: fields.company_logo,
        round_name: fields.round_name,
      },
      job_details: {
        ...opp.job_details,
        job_role: fields.role,
        salary_ctc: fields.salary,
        location: fields.location,
        stipend: fields.stipend,
        work_mode: fields.work_mode,
        employment_type: fields.employment_type,
      },
      eligibility: {
        ...opp.eligibility,
        minimum_cgpa_percentage: fields.cgpa,
        active_backlogs_allowed: fields.backlog,
        passing_batch: fields.batch,
        eligible_branches: fields.branches,
        branches: branchesArray,
        educational_qualification: fields.educational_qualification,
        eligible_streams: fields.eligible_streams,
        cutoff_criteria: fields.cutoff_criteria,
        gender_eligibility: fields.gender_eligibility,
      },
      recruitment_process: {
        ...opp.recruitment_process,
        hiring_process: fields.hiring_process,
        number_of_rounds: fields.number_of_rounds,
        elimination_rounds: fields.elimination_rounds,
      },
      schedule: {
        ...opp.schedule,
        event_date: fields.event_date,
        time: fields.time,
        venue: fields.venue,
        mode: fields.mode,
      },
      communication: {
        ...opp.communication,
        communication_channel: fields.communication_channel,
        check_inbox: fields.check_inbox,
        check_spam_folder: fields.check_spam_folder,
        timing_shared_by: fields.timing_shared_by,
        additional_instructions: fields.instructions,
      },
      attachments: {
        ...opp.attachments,
        student_eligible_list: fields.student_eligible_list,
        additional_documents: fields.additional_documents,
      },
      source_metadata: {
        ...opp.source_metadata,
        issued_by: fields.issued_by,
        institution: fields.institution,
        reminder_notice: fields.reminder_notice,
        notice_type: fields.notice_type,
      },
      instructions: fields.instructions,
      apply_link: fields.apply_link,
      source_link: fields.source_link,
      deadline: fields.deadline,
      company: fields.company,
      role: fields.role,
      type: fields.type,
      salary: fields.salary,
      location: fields.location,
    };
  } else {
    return {
      ...opp,
      company: fields.company,
      role: fields.role,
      type: fields.type,
      salary: fields.salary,
      location: fields.location,
      apply_link: fields.apply_link,
      source_link: fields.source_link,
      instructions: fields.instructions,
      deadline: fields.deadline,
      eligibility: {
        ...opp.eligibility,
        cgpa: fields.cgpa,
        backlog: fields.backlog,
        batch: fields.batch,
        branches: branchesArray,
      }
    };
  }
}

/* ─── Main component ───────────────────────────────── */

export function SmartExtractionPreview({
  data,
  stats,
  onSelectOpportunity,
  selectedOpportunityIndex = 0,
  onDataChange,
}: Props) {
  const [viewMode, setViewMode] = useState<'smart' | 'json' | 'card'>('smart');
  const [detailsModalOppIdx, setDetailsModalOppIdx] = useState<number | null>(null);
  const [isEditingModalDetails, setIsEditingModalDetails] = useState(false);
  const [modalFormFields, setModalFormFields] = useState<any>(null);

  // Handle multi-opportunities layout
  const opportunities = data.opportunities || [];
  const hasMultiple = opportunities.length > 0;

  function handleOpenDetailsModal(idx: number | null) {
    const opp = idx !== null ? opportunities[idx] : data;
    setDetailsModalOppIdx(idx === null ? -99 : idx);
    setModalFormFields(getOpportunityFields(opp));
    setIsEditingModalDetails(false);
  }

  function handleSaveModalDetails() {
    if (!onDataChange || modalFormFields === null) return;
    
    const targetIdx = detailsModalOppIdx === -99 ? null : detailsModalOppIdx;
    
    if (targetIdx !== null) {
      const updatedOpp = updateOpportunityFields(opportunities[targetIdx], modalFormFields);
      const nextOpportunities = [...opportunities];
      nextOpportunities[targetIdx] = updatedOpp;
      onDataChange({
        ...data,
        opportunities: nextOpportunities
      });
    } else {
      const updatedData = updateOpportunityFields(data, modalFormFields);
      onDataChange(updatedData);
    }
    
    setIsEditingModalDetails(false);
    toast.success('Changes saved successfully!');
  }
  
  // Use currently selected opportunity if array is present
  const currentOppData = hasMultiple ? opportunities[selectedOpportunityIndex] : data;

  const sectionKeys = Object.keys(SECTION_META);
  const populatedSections: { key: string; fields: Record<string, string> }[] = [];

  if (currentOppData) {
    for (const key of sectionKeys) {
      const section = currentOppData[key];
      if (!section || typeof section !== 'object' || Array.isArray(section)) continue;

      const fields: Record<string, string> = {};
      for (const [fieldKey, fieldValue] of Object.entries(section as Record<string, unknown>)) {
        if (fieldValue !== null && fieldValue !== undefined && String(fieldValue).trim() !== '') {
          fields[fieldKey] = String(fieldValue);
        }
      }

      if (Object.keys(fields).length > 0) {
        populatedSections.push({ key, fields });
      }
    }
  }

  const additionalInfo = currentOppData?.additional_extracted_info || [];
  const hasContent = populatedSections.length > 0 || additionalInfo.length > 0;

  const handleAddCustomDetail = (label: string, value: string, category: string) => {
    if (!onDataChange) return;

    const newItem: AdditionalInfoItem = { label, category, value };

    if (hasMultiple) {
      const updatedOpps = [...opportunities];
      const activeOpp = { ...updatedOpps[selectedOpportunityIndex] };
      activeOpp.additional_extracted_info = [
        ...(activeOpp.additional_extracted_info || []),
        newItem,
      ];
      updatedOpps[selectedOpportunityIndex] = activeOpp;
      onDataChange({ ...data, opportunities: updatedOpps });
    } else {
      const updatedData = { ...data };
      updatedData.additional_extracted_info = [
        ...(updatedData.additional_extracted_info || []),
        newItem,
      ];
      onDataChange(updatedData);
    }
  };

  const mockOpportunity = createPreviewOpportunity({
    ...currentOppData,
    id: 'preview'
  });

  const activeModalOpp = detailsModalOppIdx === null ? null : detailsModalOppIdx === -99 ? data : opportunities[detailsModalOppIdx];

  const modalMockOpp = activeModalOpp ? createPreviewOpportunity({
    ...activeModalOpp,
    id: 'modal-preview'
  }) : null;

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Extracted Data
        </h2>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('smart')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              viewMode === 'smart'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            Smart View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              viewMode === 'card'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="w-3 h-3 inline mr-1" />
            Card Preview
          </button>
          <button
            type="button"
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              viewMode === 'json'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code2 className="w-3 h-3 inline mr-1" />
            Raw JSON
          </button>
        </div>
      </div>

      {/* Multi company tabs */}
      {hasMultiple && viewMode === 'smart' && (
        <div className="border-b border-border flex flex-wrap gap-1 pb-1">
          {opportunities.map((opp, idx) => {
            const companyName = (opp.basic_information as any)?.company_name || `Company ${idx + 1}`;
            const isSelected = selectedOpportunityIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectOpportunity?.(idx)}
                className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                  isSelected
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {companyName}
              </button>
            );
          })}
        </div>
      )}

      {viewMode === 'json' ? (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-border p-4 overflow-y-auto max-h-[600px]">
          <pre className="text-xs font-mono text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : viewMode === 'card' ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            {hasMultiple ? (
              opportunities.map((opp, idx) => {
                const mockOpp = createPreviewOpportunity({
                  ...opp,
                  id: `preview-${idx}`
                }) as any;
                return (
                  <div key={idx} className="border border-slate-200 dark:border-border rounded-3xl p-6 bg-slate-50 dark:bg-muted/10">
                    <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                      Opportunity Card {idx + 1} Preview ({mockOpp.company})
                    </h3>
                    <OpportunityCard opportunity={mockOpp} onViewDetails={() => handleOpenDetailsModal(idx)} />
                  </div>
                );
              })
            ) : (
              <div className="border border-slate-200 dark:border-border rounded-3xl p-6 bg-slate-50 dark:bg-muted/10">
                <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  Opportunity Card Preview
                </h3>
                <OpportunityCard opportunity={mockOpportunity} onViewDetails={() => handleOpenDetailsModal(null)} />
              </div>
            )}
          </div>
        </div>
      ) : hasContent ? (
        <div className="space-y-3">
          <SummaryBar data={currentOppData} stats={stats} />

          {populatedSections.map(({ key, fields }) => (
            <SectionCard key={key} sectionKey={key} fields={fields} />
          ))}

          {(additionalInfo.length > 0 || onDataChange) && (
            <AdditionalInfoSection 
              items={additionalInfo} 
              onAddDetail={onDataChange ? handleAddCustomDetail : undefined}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground rounded-xl border border-dashed border-border">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No data extracted yet. Process a notice to see results.</p>
        </div>
      )}

      {/* Review Details Modal with inline editing capabilities */}
      {detailsModalOppIdx !== null && activeModalOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 dark:border-border text-foreground">
            <button 
              onClick={() => setDetailsModalOppIdx(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold p-2 bg-slate-50 dark:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4 pr-12">
                <h2 className="text-xl font-bold text-slate-950 dark:text-foreground">
                  {isEditingModalDetails ? 'Edit Opportunity Fields' : 'Review Opportunity Details'}
                </h2>
                
                {onDataChange && (
                  <button
                    onClick={() => {
                      if (isEditingModalDetails) {
                        handleSaveModalDetails();
                      } else {
                        setIsEditingModalDetails(true);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                      isEditingModalDetails 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-slate-100 dark:bg-muted text-slate-800 dark:text-foreground hover:bg-slate-200 dark:hover:bg-muted/80'
                    }`}
                  >
                    {isEditingModalDetails ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-3.5 h-3.5" /> Edit Details
                      </>
                    )}
                  </button>
                )}
              </div>

              {isEditingModalDetails && modalFormFields ? (
                <div className="space-y-4 max-w-3xl text-left max-h-[60vh] overflow-y-auto pr-2">
                  {EDIT_SECTIONS.map((section) => {
                    // Only show sections that have at least one field with a value, or all sections in edit mode
                    const hasData = section.fields.some(f => modalFormFields[f.key]?.trim());
                    
                    return (
                      <div key={section.key} className={`rounded-xl border ${hasData ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/10'} overflow-hidden`}>
                        <div className="px-4 py-2.5 border-b border-border/50">
                          <span className="text-xs font-bold text-foreground uppercase tracking-wide">{section.label}</span>
                          {!hasData && <span className="text-[10px] text-muted-foreground ml-2">(empty)</span>}
                        </div>
                        <div className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {section.fields.map((field) => {
                              // Special handling for type dropdown
                              if (field.key === 'type') {
                                return (
                                  <div key={field.key}>
                                    <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                                    <select
                                      value={modalFormFields[field.key] || ''}
                                      onChange={e => setModalFormFields({...modalFormFields, [field.key]: e.target.value})}
                                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:border-primary"
                                    >
                                      <option value="placement">Placement</option>
                                      <option value="internship">Internship</option>
                                      <option value="hackathon">Hackathon</option>
                                      <option value="scholarship">Scholarship</option>
                                      <option value="campus_drive">Campus Drive</option>
                                      <option value="fellowship">Fellowship</option>
                                      <option value="competition">Competition</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </div>
                                );
                              }

                              // Textarea fields
                              if (field.type === 'textarea') {
                                return (
                                  <div key={field.key} className="md:col-span-2">
                                    <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                                    <textarea
                                      value={modalFormFields[field.key] || ''}
                                      onChange={e => setModalFormFields({...modalFormFields, [field.key]: e.target.value})}
                                      rows={4}
                                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:border-primary"
                                    />
                                  </div>
                                );
                              }

                              // Datetime fields
                              if (field.type === 'datetime-local') {
                                return (
                                  <div key={field.key}>
                                    <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                                    <input
                                      type="datetime-local"
                                      value={modalFormFields[field.key] ? modalFormFields[field.key].substring(0, 16) : ''}
                                      onChange={e => setModalFormFields({...modalFormFields, [field.key]: e.target.value})}
                                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:border-primary"
                                    />
                                  </div>
                                );
                              }

                              // Default text input
                              return (
                                <div key={field.key}>
                                  <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                                  <input
                                    value={modalFormFields[field.key] || ''}
                                    onChange={e => setModalFormFields({...modalFormFields, [field.key]: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:border-primary"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="flex gap-2 justify-end pt-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingModalDetails(false)}
                      className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveModalDetails}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-left">
                  {modalMockOpp && (
                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        {/* Header Details Preview */}
                        <div className="rounded-2xl border bg-slate-50 dark:bg-card p-6 md:p-8">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                              <Building2 className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                              <h1 className="text-2xl font-bold">{modalMockOpp.role}</h1>
                              <p className="text-muted-foreground font-medium">{modalMockOpp.company}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-medium">
                            <span className="px-3 py-1 rounded-full border bg-white dark:bg-muted text-foreground">{modalMockOpp.type}</span>
                            {modalMockOpp.location && <span className="px-3 py-1 rounded-full border bg-white dark:bg-muted text-foreground">{modalMockOpp.location}</span>}
                            {modalMockOpp.salary && <span className="px-3 py-1 rounded-full border bg-white dark:bg-muted text-foreground">{modalMockOpp.salary}</span>}
                            {modalMockOpp.deadline && <span className="px-3 py-1 rounded-full border bg-white dark:bg-muted text-foreground">Deadline: {new Date(modalMockOpp.deadline).toLocaleDateString()}</span>}
                          </div>
                        </div>

                        {/* Opportunity detail tabs */}
                        <OpportunityDetailTabs data={activeModalOpp} />
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border bg-slate-50 dark:bg-card p-6">
                          <h3 className="font-semibold mb-4 text-sm">Quick Info</h3>
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span className="font-semibold">{modalMockOpp.company}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-semibold">{modalMockOpp.role}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-semibold">{modalMockOpp.type}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-semibold">{modalMockOpp.location || 'TBD'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Salary</span><span className="font-semibold">{modalMockOpp.salary || 'TBD'}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
