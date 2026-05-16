'use client';

import { useEffect, useState } from 'react';
import { ContributionActions } from './ContributionActions';

export default function ContributionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState('pending');

  async function load() {
    const res = await fetch('/api/admin/contributions/list?status=' + tab);
    const data = await res.json();
    setItems(data || []);
  }

  useEffect(() => {
    load();
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex gap-3">
        {['pending','approved','rejected'].map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`px-5 py-3 rounded-xl ${
              tab === x ? 'bg-primary text-white' : 'border'
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      {items.map((item) => (
        <div key={item.id} className="border rounded-2xl p-6 bg-card space-y-5">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Contributor</p>
              <p>{item.contributor_name}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p>{item.contributor_email}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Student ID</p>
              <p>{item.contributor_student_id || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p>{item.status}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold">{item.title}</h2>
          <p>{item.content}</p>

          {item.rejection_reason && (
            <div className="border border-red-500 rounded-xl p-4">
              {item.rejection_reason}
            </div>
          )}

          {tab === 'pending' && (
            <ContributionActions
              id={item.id}
              title={item.title}
              content={item.content}
              contributionType={item.contribution_type}
            />
          )}
        </div>
      ))}
    </div>
  );
}
