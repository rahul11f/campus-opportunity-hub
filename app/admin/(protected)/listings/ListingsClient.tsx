'use client';

import { useMemo, useState } from 'react';
import { ListingsActions } from './ListingsActions';
import {
  Briefcase,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  Search,
  Star,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

function getDaysLeft(deadline?: string | null) {
  if (!deadline) return null;

  const now = new Date();
  const end = new Date(deadline);

  return Math.ceil(
    (end.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export default function ListingsClient({
  data,
}: {
  data: any[];
}) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const match =
        item.role?.toLowerCase().includes(query.toLowerCase()) ||
        item.company?.toLowerCase().includes(query.toLowerCase());

      if (!match) return false;

      if (tab === 'live')
        return item.is_published && !item.is_expired;

      if (tab === 'draft')
        return !item.is_published && !item.is_expired;

      if (tab === 'expired')
        return item.is_expired;

      if (tab === 'featured')
        return item.featured;

      return true;
    });
  }, [data, query, tab]);

  const live = data.filter(
    (x) => x.is_published && !x.is_expired
  ).length;

  const draft = data.filter(
    (x) => !x.is_published && !x.is_expired
  ).length;

  const expired = data.filter(
    (x) => x.is_expired
  ).length;

  const featured = data.filter(
    (x) => x.featured
  ).length;

  const student = data.filter(
    (x) => x.source_type === 'student'
  ).length;

  return (
    <div className="max-w-[1700px] mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-bold">
            Opportunity Intelligence Center
          </h1>

          <p className="text-muted-foreground mt-2">
            Manage listings, publishing and student contributions
          </p>
        </div>

        <a
          href="/admin/new"
          className="px-6 py-4 rounded-2xl bg-primary text-white font-semibold"
        >
          + New Listing
        </a>
      </div>

      <div className="grid md:grid-cols-5 gap-5">
        <Stat title="Live" value={live} icon={<CheckCircle2 />} />
        <Stat title="Draft" value={draft} icon={<Clock3 />} />
        <Stat title="Expired" value={expired} icon={<XCircle />} />
        <Stat title="Featured" value={featured} icon={<Star />} />
        <Stat title="Student Notices" value={student} icon={<ShieldCheck />} />
      </div>

      <div className="rounded-3xl border bg-card p-6 flex justify-between flex-wrap gap-4">
        <div className="flex gap-3 flex-wrap">
          {[
            ['all', 'All'],
            ['live', 'Live'],
            ['draft', 'Draft'],
            ['expired', 'Expired'],
            ['featured', 'Featured'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-5 py-3 rounded-xl border ${
                tab === id
                  ? 'bg-primary text-white'
                  : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 border rounded-2xl px-4">
          <Search className="w-4 h-4" />
          <input
            placeholder="Search company / role..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            className="bg-transparent outline-none py-3"
          />
        </div>
      </div>

      <div className="rounded-3xl border bg-card overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-6 py-5 border-b text-sm font-semibold text-muted-foreground">
          <div>Opportunity</div>
          <div>Status</div>
          <div>Deadline</div>
          <div>Views</div>
          <div>Source</div>
          <div>Contributor</div>
          <div>Actions</div>
        </div>

        {filtered.map((item) => {
          const days = getDaysLeft(item.deadline);

          return (
            <div
              key={item.id}
              className="grid grid-cols-7 gap-4 px-6 py-6 border-b items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {item.role}
                  </p>

                  {item.featured && (
                    <Star className="w-4 h-4 text-yellow-400" />
                  )}
                </div>

                <p className="text-muted-foreground">
                  {item.company}
                </p>
              </div>

              <div>
                {item.is_expired ? (
                  <Badge color="red">Expired</Badge>
                ) : item.is_published ? (
                  <Badge color="green">Live</Badge>
                ) : (
                  <Badge color="yellow">Draft</Badge>
                )}
              </div>

              <div>
                {item.deadline || 'No deadline'}

                {days !== null && days >= 0 && (
                  <p className="text-green-400 text-sm">
                    In {days} days
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {item.views || 0}
              </div>

              <div>
                {item.source_type === 'student' ? (
                  <Badge color="blue">
                    Student
                  </Badge>
                ) : (
                  <Badge color="gray">
                    Admin
                  </Badge>
                )}
              </div>

              <div>
                {item.contributor_name || 'Admin'}
              </div>

              <div>
                <ListingsActions
                  id={item.id}
                  isPublished={item.is_published}
                  isFeatured={item.featured}
                  isExpired={item.is_expired}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  title,
  value,
  icon,
}: any) {
  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="mb-4">{icon}</div>
      <p>{title}</p>
      <p className="text-4xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Badge({
  children,
  color,
}: any) {
  const map: any = {
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    blue: 'bg-blue-500/20 text-blue-400',
    gray: 'bg-muted text-muted-foreground',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${map[color]}`}>
      {children}
    </span>
  );
}