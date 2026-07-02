'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type {
  ExtractedOpportunity,
  OpportunityType,
  AdditionalInfoItem,
} from '@/types/opportunity';
import { AdvancedSlotsAccordion } from './AdvancedSlotsAccordion';
import { OpportunityCard } from '@/components/opportunity/OpportunityCard';
import { AttachmentUploader } from './AttachmentUploader';

type Props = {
  initialData?: Partial<ExtractedOpportunity> | null;
  rawText?: string;
  sourceLink?: string | null;
  existingId?: string;
  contributionId?: string;
  additionalInfo?: AdditionalInfoItem[];
  onSuccess?: (isPublished: boolean, data: any) => void;
};

const TYPES: OpportunityType[] = [
  'placement',
  'internship',
  'hackathon',
  'scholarship',
  'campus_drive',
  'fellowship',
  'competition',
  'other',
];

function toLocalDateTime(value?: string | null) {
  if (!value) return '';

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return '';

  const pad = (n: number) =>
    String(n).padStart(2, '0');

  return `${d.getFullYear()}-${pad(
    d.getMonth() + 1
  )}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function OpportunityForm({
  initialData,
  rawText = '',
  sourceLink = '',
  existingId,
  contributionId,
  additionalInfo = [],
  onSuccess,
}: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] =
    useState('');
  const [tagInput, setTagInput] =
    useState('');
  const [respInput, setRespInput] =
    useState('');

  // Robust helper to support old flat data and new 8-section Gemini structures
  const companyVal = initialData?.company || (initialData as any)?.basic_information?.company_name || '';
  const roleVal = initialData?.role || (initialData as any)?.job_details?.job_role || '';
  const rawType = initialData?.type || (initialData as any)?.basic_information?.opportunity_type || 'placement';
  const typeVal = TYPES.includes(String(rawType).toLowerCase() as any)
    ? (String(rawType).toLowerCase() as OpportunityType)
    : 'placement';
  const salaryVal = initialData?.salary || (initialData as any)?.job_details?.salary_ctc || '';
  const locationVal = initialData?.location || (initialData as any)?.job_details?.location || '';
  const applyLinkVal = initialData?.apply_link || (initialData as any)?.basic_information?.jd_link || (initialData as any)?.attachments?.jd_link || '';
  // Build instructions from explicit field + additional info items categorized as instructions/logistics
  const baseInstructions = initialData?.instructions || (initialData as any)?.communication?.additional_instructions || '';
  const additionalInstructionItems = additionalInfo
    .filter(item => item.category === 'instructions' || item.category === 'logistics')
    .map(item => `${item.label}: ${item.value}`)
    .join('\n');
  const instructionsVal = [baseInstructions, additionalInstructionItems].filter(Boolean).join('\n\n');
  const deadlineVal = toLocalDateTime(initialData?.deadline || (initialData as any)?.basic_information?.application_deadline);

  // Map additional info items into custom eligibility slots
  const additionalSlots: Record<string, string> = {};
  for (const item of additionalInfo) {
    if (item.category !== 'instructions' && item.category !== 'logistics') {
      const slotKey = item.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      if (slotKey) {
        additionalSlots[slotKey] = item.value;
      }
    }
  }

  const safeParseArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const initialEligibility = initialData?.eligibility || {};
  const rawBranches = (initialEligibility as any).branches || (initialEligibility as any).eligible_branches;
  const initialBranches = safeParseArray(rawBranches);
  const initialCgpa = (initialEligibility as any).cgpa || (initialEligibility as any).minimum_cgpa_percentage || '';
  const initialBacklog = (initialEligibility as any).backlog || (initialEligibility as any).active_backlogs_allowed || '';
  const initialBatch = (initialEligibility as any).batch || (initialEligibility as any).passing_batch || '';
  const initialOther = (initialEligibility as any).other || (initialEligibility as any).cutoff_criteria || '';

  const initialSkills = safeParseArray(initialData?.skills);
  const initialResponsibilities = safeParseArray(initialData?.responsibilities || (initialEligibility as any).responsibilities_list);
  const initialTags = safeParseArray(initialData?.tags);
  const initialDescription = safeParseArray(initialData?.interview_process?.description || (initialData as any)?.recruitment_process?.hiring_process);

  const [form, setForm] = useState({
    company: companyVal,
    role: roleVal,
    type: typeVal as any,
    salary: salaryVal,
    location: locationVal,
    apply_link: applyLinkVal,
    source_link: sourceLink || '',
    instructions: instructionsVal,
    deadline: deadlineVal,
    featured: false,
    is_published: false,
    skills: initialSkills,
    responsibilities: initialResponsibilities,
    tags: initialTags,
    eligibility: {
      branches: initialBranches,
      cgpa: initialCgpa,
      backlog: initialBacklog,
      batch: initialBatch,
      other: initialOther,
      company_logo: (initialData as any)?.basic_information?.company_logo || '',
      round_name: (initialData as any)?.basic_information?.round_name || '',
      verified_status: (initialData as any)?.basic_information?.verified_status || '',
      educational_qualification: (initialEligibility as any).educational_qualification || (initialEligibility as any).education_qualification || '',
      eligible_branches: (initialEligibility as any).eligible_branches || '',
      eligible_streams: (initialEligibility as any).eligible_streams || '',
      passing_batch: (initialEligibility as any).passing_batch || '',
      minimum_cgpa_percentage: (initialEligibility as any).minimum_cgpa_percentage || '',
      cutoff_criteria: (initialEligibility as any).cutoff_criteria || '',
      active_backlogs_allowed: (initialEligibility as any).active_backlogs_allowed || '',
      gender_eligibility: (initialEligibility as any).gender_eligibility || '',
      job_role: (initialData as any)?.job_details?.job_role || '',
      salary_ctc: (initialData as any)?.job_details?.salary_ctc || '',
      stipend: (initialData as any)?.job_details?.stipend || '',
      work_mode: (initialData as any)?.job_details?.work_mode || '',
      employment_type: (initialData as any)?.job_details?.employment_type || '',
      hiring_process: (initialData as any)?.recruitment_process?.hiring_process || '',
      number_of_rounds: (initialData as any)?.recruitment_process?.number_of_rounds || '',
      elimination_rounds: (initialData as any)?.recruitment_process?.elimination_rounds || '',
      event_date: (initialData as any)?.schedule?.event_date || '',
      time: (initialData as any)?.schedule?.time || '',
      venue: (initialData as any)?.schedule?.venue || '',
      mode: (initialData as any)?.schedule?.mode || '',
      communication_channel: (initialData as any)?.communication?.communication_channel || '',
      check_inbox: (initialData as any)?.communication?.check_inbox || '',
      check_spam_folder: (initialData as any)?.communication?.check_spam_folder || '',
      timing_shared_by: (initialData as any)?.communication?.timing_shared_by || '',
      student_eligible_list: (initialData as any)?.attachments?.student_eligible_list || '',
      additional_documents: (initialData as any)?.attachments?.additional_documents || '',
      issued_by: (initialData as any)?.source_metadata?.issued_by || '',
      institution: (initialData as any)?.source_metadata?.institution || '',
      reminder_notice: (initialData as any)?.source_metadata?.reminder_notice || '',
      notice_type: (initialData as any)?.source_metadata?.notice_type || '',
      ...additionalSlots,
    },
    interview_process: {
      rounds: initialData?.interview_process?.rounds || null,
      description: initialDescription,
    },
    attachments_json: initialData?.attachments_json || [],
    raw_text: rawText || (initialData ? JSON.stringify(initialData, null, 2) : ''),
  });

  const confidence =
    initialData?.confidence_score;

  const preview = useMemo(
    () => ({
      ...form,
      deadline:
        form.deadline || 'No deadline',
    }),
    [form]
  );



  async function submit(
    isPublished: boolean
  ) {
    if (
      !form.company.trim() ||
      !form.role.trim()
    ) {
      toast.error(
        'Company and role are required'
      );
      return;
    }

    if (isPublished) {
      const confirmed = confirm(
        `Publish this opportunity?\n\nCompany: ${form.company}\nRole: ${form.role}`
      );

      if (!confirmed) {
        return;
      }
    }

    setSaving(true);

    try {
      // Safely parse deadline to avoid RangeError crash on empty string
      let parsedDeadline = null;
      if (form.deadline && !isNaN(new Date(form.deadline).getTime())) {
        parsedDeadline = new Date(form.deadline).toISOString();
      }

      const payload = {
        ...form,
        is_published: isPublished,
        deadline: parsedDeadline,
        apply_link:
          form.apply_link || null,
        source_link:
          form.source_link || null,
        contribution_id: (contributionId && contributionId !== 'undefined' && contributionId !== 'null')
          ? contributionId
          : null,
      };

      const res = await fetch(
        existingId
          ? `/api/opportunities/${existingId}`
          : '/api/opportunities',
        {
          method: existingId
            ? 'PATCH'
            : 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(
            'Duplicate listing detected. Similar opportunity already exists.'
          );
        }

        if (data?.details) {
          const fieldErrors = Object.entries(data.details)
            .filter(([key]) => key !== '_errors')
            .map(([key, val]: any) => `${key}: ${val._errors?.join(', ') || 'Invalid field'}`)
            .join('; ');
          throw new Error(`Validation failed - ${fieldErrors}`);
        }

        throw new Error(
          data?.error || 'Save failed'
        );
      }

      toast.success(
        isPublished
          ? 'Published successfully'
          : 'Draft saved successfully'
      );

      onSuccess?.(isPublished, data);

      if (!onSuccess) {
        if (isPublished) {
          router.push(
            `/opportunities/${
              data.id || existingId
            }`
          );
        } else {
          router.push(
            '/admin/listings?status=draft'
          );
        }
      }

      router.refresh();
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Request failed'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {typeof confidence ===
          'number' && (
          <div className="p-3 rounded-xl border">
            AI confidence:{' '}
            {Math.round(
              confidence * 100
            )}
            %
          </div>
        )}

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Company"
          value={form.company}
          onChange={(e) =>
            setForm({
              ...form,
              company:
                e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Role"
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role:
                e.target.value,
            })
          }
        />

        <select
          className="w-full border rounded-xl p-3"
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target
                .value as OpportunityType,
            })
          }
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Salary"
          value={form.salary}
          onChange={(e) =>
            setForm({
              ...form,
              salary:
                e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Location"
          value={form.location}
          onChange={(e) =>
            setForm({
              ...form,
              location:
                e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded-xl p-3"
          type="datetime-local"
          value={form.deadline}
          onChange={(e) =>
            setForm({
              ...form,
              deadline:
                e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Apply link"
          value={form.apply_link}
          onChange={(e) =>
            setForm({
              ...form,
              apply_link:
                e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded-xl p-3"
          placeholder="Source link"
          value={form.source_link}
          onChange={(e) =>
            setForm({
              ...form,
              source_link:
                e.target.value,
            })
          }
        />

        <textarea
          className="w-full border rounded-xl p-3"
          rows={4}
          placeholder="Instructions"
          value={form.instructions}
          onChange={(e) =>
            setForm({
              ...form,
              instructions:
                e.target.value,
            })
          }
        />

        <div className="flex gap-3">
          <button
            disabled={saving}
            onClick={() =>
              submit(false)
            }
            className="px-4 py-3 rounded-xl border"
          >
            Save Draft
          </button>

          <button
            disabled={saving}
            onClick={() =>
              submit(true)
            }
            className="px-4 py-3 rounded-xl border bg-black text-white"
          >
            Publish
          </button>
        </div>

        {existingId ? (
          <AttachmentUploader
            opportunityId={existingId}
            attachments={form.attachments_json || []}
            onAttachmentsChange={(attachments) =>
              setForm({ ...form, attachments_json: attachments })
            }
          />
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
            Save draft or publish to enable uploading PDF or Excel attachments.
          </div>
        )}

        <AdvancedSlotsAccordion form={form} setForm={setForm} />

      </div>

      <div className="border border-slate-200 dark:border-border rounded-3xl p-6 bg-slate-50 dark:bg-muted/10 flex flex-col justify-between h-fit space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-foreground mb-4">
            Student Opportunity Preview
          </h3>
          <OpportunityCard opportunity={{
            ...form,
            id: 'preview',
            eligibility: {
              ...form.eligibility,
              cgpa: form.eligibility.cgpa || form.eligibility.minimum_cgpa_percentage || null,
              branches: form.eligibility.branches || (form.eligibility.eligible_branches ? [form.eligibility.eligible_branches] : []),
              batch: form.eligibility.batch || form.eligibility.passing_batch || null,
              backlog: form.eligibility.backlog || form.eligibility.active_backlogs_allowed || null,
            },
            company_logo: form.eligibility.company_logo || null,
          }} />
        </div>
        <div className="text-xs text-muted-foreground p-3 bg-white dark:bg-card border rounded-xl space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Form Checklist Details:</p>
          <p><strong>Instructions:</strong> {form.instructions ? (form.instructions.length > 100 ? `${form.instructions.substring(0, 100)}...` : form.instructions) : 'None'}</p>
          <p><strong>Apply Link:</strong> {form.apply_link || 'None'}</p>
          <p><strong>Source Link:</strong> {form.source_link || 'None'}</p>
        </div>
      </div>
    </div>
  );
}
