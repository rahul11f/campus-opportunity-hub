'use client';

import { useState } from 'react';

export function ContributionActions({
  id,
  title,
  content,
  contributionType,
}: {
  id: string;
  title: string;
  content: string;
  contributionType: string;
}) {
  const [loading, setLoading] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [editedType, setEditedType] =
    useState(contributionType);
  const [rejectionReason, setRejectionReason] =
    useState('');

  async function approve() {
    setLoading(true);

    await fetch(
      '/api/admin/contributions/approve',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          contributionId: id,
          title: editedTitle,
          content: editedContent,
          contributionType: editedType,
        }),
      }
    );

    location.reload();
  }

  async function reject() {
    setLoading(true);

    await fetch(
      '/api/admin/contributions/reject',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          contributionId: id,
          rejectionReason,
        }),
      }
    );

    location.reload();
  }

  return (
    <div className="space-y-4">
      <input
        value={editedTitle}
        onChange={(e) =>
          setEditedTitle(e.target.value)
        }
        className="w-full border rounded-xl p-3 bg-background"
      />

      <input
        value={editedType}
        onChange={(e) =>
          setEditedType(e.target.value)
        }
        className="w-full border rounded-xl p-3 bg-background"
      />

      <textarea
        value={editedContent}
        onChange={(e) =>
          setEditedContent(
            e.target.value
          )
        }
        rows={8}
        className="w-full border rounded-xl p-3 bg-background"
      />

      <textarea
        value={rejectionReason}
        onChange={(e) =>
          setRejectionReason(
            e.target.value
          )
        }
        rows={3}
        placeholder="Rejection reason"
        className="w-full border rounded-xl p-3 bg-background"
      />

      <div className="flex gap-3">
        <button
          disabled={loading}
          onClick={approve}
          className="px-5 py-3 rounded-xl bg-green-600 text-white font-semibold"
        >
          Approve + Publish
        </button>

        <button
          disabled={loading}
          onClick={reject}
          className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
