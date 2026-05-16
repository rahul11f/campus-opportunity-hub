'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Send, FileText, Link2, Briefcase } from 'lucide-react';

export default function ContributePage() {
  const [title, setTitle] = useState('');
  const [contributionType, setContributionType] = useState('placement');
  const [content, setContent] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitContribution() {
    try {
      setSubmitting(true);

      const res = await fetch('/api/student/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          contributionType,
          content,
          sourceLink,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success('Contribution submitted for admin review');

      setTitle('');
      setContributionType('placement');
      setContent('');
      setSourceLink('');
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Submission failed'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          Contribute to Campus Community
        </h1>

        <p className="text-muted-foreground mt-3">
          Help other students by sharing placement drives,
          internships, academic notices, results, or useful updates.
        </p>
      </div>

      <div className="bg-card border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-2">
            Contribution Title
          </label>

          <div className="relative">
            <FileText className="w-4 h-4 absolute left-4 top-4 text-muted-foreground" />

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TCS Ninja Hiring 2026"
              className="w-full pl-11 pr-4 py-4 rounded-2xl border bg-background"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Contribution Type
          </label>

          <select
            value={contributionType}
            onChange={(e) =>
              setContributionType(e.target.value)
            }
            className="w-full px-4 py-4 rounded-2xl border bg-background"
          >
            <option value="placement">Placement</option>
            <option value="internship">Internship</option>
            <option value="notice">Academic Notice</option>
            <option value="result">Result Update</option>
            <option value="event">College Event</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Source Link (optional)
          </label>

          <div className="relative">
            <Link2 className="w-4 h-4 absolute left-4 top-4 text-muted-foreground" />

            <input
              value={sourceLink}
              onChange={(e) =>
                setSourceLink(e.target.value)
              }
              placeholder="https://..."
              className="w-full pl-11 pr-4 py-4 rounded-2xl border bg-background"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Details / Description
          </label>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Share all important details students should know..."
            className="w-full border rounded-2xl p-4 bg-background"
          />
        </div>

        <button
          onClick={submitContribution}
          disabled={
            submitting ||
            !title ||
            !contributionType
          }
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold"
        >
          <Send className="w-4 h-4" />
          {submitting
            ? 'Submitting...'
            : 'Submit Contribution'}
        </button>
      </div>
    </div>
  );
}
