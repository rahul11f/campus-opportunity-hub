'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  User,
  Mail,
  IdCard,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContributionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState('pending');

  async function load() {
    const res = await fetch(
      '/api/admin/contributions/list?status=' + tab
    );

    const data = await res.json();
    setItems(data || []);
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function approve(item: any) {
    const title =
      prompt('Edit title before approval', item.title) ||
      item.title;

    const contributionType =
      prompt(
        'Edit type',
        item.contribution_type
      ) || item.contribution_type;

    const content =
      prompt(
        'Edit content before approval',
        item.content
      ) || item.content;

    const res = await fetch(
      '/api/admin/contributions/approve',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contributionId: item.id,
          title,
          content,
          contributionType,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || 'Approval failed');
      return;
    }

    toast.success('Contribution approved');
    load();
  }

  async function reject(item: any) {
    const rejectionReason =
      prompt('Rejection reason') ||
      'Rejected by admin';

    const res = await fetch(
      '/api/admin/contributions/reject',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contributionId: item.id,
          rejectionReason,
        }),
      }
    );

    if (!res.ok) {
      toast.error('Reject failed');
      return;
    }

    toast.success('Contribution rejected');
    load();
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Contribution Moderation
        </h1>

        <p className="text-muted-foreground mt-3">
          Review student submitted notices before publishing
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {['pending', 'approved', 'rejected'].map(
          (x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`px-5 py-3 rounded-2xl ${
                tab === x
                  ? 'bg-primary text-white'
                  : 'border'
              }`}
            >
              {x}
            </button>
          )
        )}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-3xl border bg-card p-8 space-y-6"
        >
          <div className="grid md:grid-cols-4 gap-5">
            <Meta
              icon={<User />}
              title="Contributor"
              value={item.contributor_name}
            />

            <Meta
              icon={<Mail />}
              title="Email"
              value={item.contributor_email}
            />

            <Meta
              icon={<IdCard />}
              title="Student ID"
              value={
                item.contributor_student_id ||
                'N/A'
              }
            />

            <Meta
              icon={<CheckCircle2 />}
              title="Status"
              value={item.status}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {item.title}
            </h2>

            <p className="text-muted-foreground mt-2">
              {item.contribution_type}
            </p>
          </div>

          <div className="rounded-2xl border p-6 whitespace-pre-wrap">
            {item.content}
          </div>

          {item.source_link && (
            <a
              href={item.source_link}
              target="_blank"
              className="inline-flex items-center gap-2 text-primary"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Source
            </a>
          )}

          {item.rejection_reason && (
            <div className="rounded-2xl border border-red-500 p-4 text-red-400">
              {item.rejection_reason}
            </div>
          )}

          {tab === 'pending' && (
            <div className="flex gap-4">
              <button
                onClick={() => approve(item)}
                className="px-6 py-4 rounded-2xl bg-green-600 text-white font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>

              <button
                onClick={() => reject(item)}
                className="px-6 py-4 rounded-2xl bg-red-600 text-white font-semibold flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Meta({
  icon,
  title,
  value,
}: any) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">
          {title}
        </span>
      </div>

      <p className="font-semibold break-all">
        {value}
      </p>
    </div>
  );
}