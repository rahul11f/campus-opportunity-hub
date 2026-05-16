'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type {
  ExtractedOpportunity,
  OpportunityType,
} from '@/types/opportunity';

type Props = {
  initialData?: Partial<ExtractedOpportunity> | null;
  rawText?: string;
  sourceLink?: string | null;
  existingId?: string;
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
}: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] =
    useState('');
  const [tagInput, setTagInput] =
    useState('');
  const [respInput, setRespInput] =
    useState('');

  const [form, setForm] = useState({
    company: initialData?.company || '',
    role: initialData?.role || '',
    type: initialData?.type || 'placement',
    salary: initialData?.salary || '',
    location: initialData?.location || '',
    apply_link: initialData?.apply_link || '',
    source_link: sourceLink || '',
    instructions:
      initialData?.instructions || '',
    deadline: toLocalDateTime(
      initialData?.deadline
    ),
    featured: false,
    is_published: false,
    skills: initialData?.skills || [],
    responsibilities:
      initialData?.responsibilities || [],
    tags: initialData?.tags || [],
    eligibility: {
      branches:
        initialData?.eligibility?.branches ||
        [],
      cgpa:
        initialData?.eligibility?.cgpa || '',
      backlog:
        initialData?.eligibility?.backlog ||
        '',
      batch:
        initialData?.eligibility?.batch || '',
      other:
        initialData?.eligibility?.other || '',
    },
    interview_process: {
      rounds:
        initialData?.interview_process
          ?.rounds || null,
      description:
        initialData?.interview_process
          ?.description || [],
    },
    raw_text: rawText,
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
      const payload = {
        ...form,
        is_published: isPublished,
        deadline: form.deadline
          ? new Date(
              form.deadline
            ).toISOString()
          : null,
        apply_link:
          form.apply_link || null,
        source_link:
          form.source_link || null,
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

        throw new Error(
          data?.error || 'Save failed'
        );
      }

      toast.success(
        isPublished
          ? 'Published successfully'
          : 'Draft saved successfully'
      );

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
      </div>

      <div className="border rounded-2xl p-5">
        <h3 className="text-lg font-semibold mb-4">
          Preview
        </h3>

        <div className="space-y-2 text-sm">
          <div>
            <strong>
              {preview.company}
            </strong>
          </div>
          <div>{preview.role}</div>
          <div>{preview.type}</div>
          <div>
            {preview.salary ||
              'Not specified'}
          </div>
          <div>
            {preview.location ||
              'Not specified'}
          </div>
          <div>{preview.deadline}</div>
          <div>
            {preview.instructions ||
              'No instructions'}
          </div>
        </div>
      </div>
    </div>
  );
}
