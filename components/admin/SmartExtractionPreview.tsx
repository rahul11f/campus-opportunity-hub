'use client';

import { useState } from 'react';
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
  PlusCircle, // Added for adding custom slots
} from 'lucide-react';
import { OpportunityCard } from '@/components/opportunity/OpportunityCard';

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

/* ─── Main component ───────────────────────────────── */

export function SmartExtractionPreview({
  data,
  stats,
  onSelectOpportunity,
  selectedOpportunityIndex = 0,
  onDataChange,
}: Props) {
  const [viewMode, setViewMode] = useState<'smart' | 'json' | 'card'>('smart');

  // Handle multi-opportunities layout
  const opportunities = data.opportunities || [];
  const hasMultiple = opportunities.length > 0;
  
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

  const mockOpportunity = {
    id: 'preview',
    company: currentOppData?.basic_information?.company_name || 'Company Name',
    role: currentOppData?.job_details?.job_role || 'Job Role',
    type: currentOppData?.basic_information?.opportunity_type || 'placement',
    salary: currentOppData?.job_details?.salary_ctc || currentOppData?.salary || null,
    location: currentOppData?.job_details?.location || currentOppData?.location || null,
    deadline: currentOppData?.basic_information?.application_deadline || currentOppData?.deadline || null,
    eligibility: {
      cgpa: currentOppData?.eligibility?.minimum_cgpa_percentage || null,
      branches: currentOppData?.eligibility?.eligible_branches ? [currentOppData.eligibility.eligible_branches] : [],
      batch: currentOppData?.eligibility?.passing_batch || null,
      backlog: currentOppData?.eligibility?.active_backlogs_allowed || null,
    },
    company_logo: currentOppData?.basic_information?.company_logo || null,
  };

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
                const mockOpp = {
                  id: `preview-${idx}`,
                  company: opp.basic_information?.company_name || `Company ${idx + 1}`,
                  role: opp.job_details?.job_role || 'Job Role',
                  type: opp.basic_information?.opportunity_type || 'placement',
                  salary: opp.job_details?.salary_ctc || opp.salary || null,
                  location: opp.job_details?.location || opp.location || null,
                  deadline: opp.basic_information?.application_deadline || opp.deadline || null,
                  eligibility: {
                    cgpa: opp.eligibility?.minimum_cgpa_percentage || null,
                    branches: opp.eligibility?.eligible_branches ? [opp.eligibility.eligible_branches] : [],
                    batch: opp.eligibility?.passing_batch || null,
                    backlog: opp.eligibility?.active_backlogs_allowed || null,
                  },
                  company_logo: opp.basic_information?.company_logo || null,
                };
                return (
                  <div key={idx} className="border border-slate-200 dark:border-border rounded-3xl p-6 bg-slate-50 dark:bg-muted/10">
                    <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                      Opportunity Card {idx + 1} Preview ({mockOpp.company})
                    </h3>
                    <OpportunityCard opportunity={mockOpp} />
                  </div>
                );
              })
            ) : (
              <div className="border border-slate-200 dark:border-border rounded-3xl p-6 bg-slate-50 dark:bg-muted/10">
                <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  Opportunity Card Preview
                </h3>
                <OpportunityCard opportunity={mockOpportunity} />
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
    </div>
  );
}
