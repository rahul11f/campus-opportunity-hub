import { createServiceClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Users,
  Trophy,
  Clock3,
  CheckCircle2,
  XCircle,
  Briefcase,
  Zap,
  TrendingUp,
  BarChart3,
  Activity,
} from 'lucide-react';
import { AdminControlCenter } from '@/components/admin/AdminControlCenter';

async function getData() {
  const supabase = createServiceClient();
  const today =
    new Date().toISOString().split('T')[0];

  const [
    pending,
    approved,
    rejected,
    students,
    listings,
    top,
    leaderboard,
    recent,
    usage,
  ] = await Promise.all([
    supabase
      .from('student_contributions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    supabase
      .from('student_contributions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),

    supabase
      .from('student_contributions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected'),

    supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('student_points')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('student_points')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(5),

    supabase
      .from('student_contributions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('api_usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  return {
    pending: pending.count || 0,
    approved: approved.count || 0,
    rejected: rejected.count || 0,
    students: students.count || 0,
    listings: listings.count || 0,
    top: top.data,
    leaderboard: leaderboard.data || [],
    recent: recent.data || [],
    usage: usage.data || [],
  };
}

export default async function AdminDashboardPage() {
  const data = await getData();

  const totalModerated =
    data.approved + data.rejected;

  const approvalRate =
    totalModerated > 0
      ? Math.round(
          (data.approved / totalModerated) * 100
        )
      : 0;

  return (
    <div className="max-w-[1700px] mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Admin Intelligence Center
        </h1>

        <p className="text-muted-foreground mt-2">
          Platform operations, moderation and analytics
        </p>
      </div>

      <div className="grid md:grid-cols-6 gap-5">
        <Card icon={<Clock3 />} title="Pending" value={data.pending} />
        <Card icon={<CheckCircle2 />} title="Approved" value={data.approved} />
        <Card icon={<XCircle />} title="Rejected" value={data.rejected} />
        <Card icon={<Users />} title="Students" value={data.students} />
        <Card icon={<Briefcase />} title="Listings" value={data.listings} />
        <Card icon={<Trophy />} title="Top Score" value={data.top?.total_points || 0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <BarChart3 />
            <h2 className="text-2xl font-bold">
              Moderation Analytics
            </h2>
          </div>

          <div className="space-y-5">
            <Metric
              label="Approval Rate"
              value={`${approvalRate}%`}
            />

            <Metric
              label="Total Moderated"
              value={totalModerated}
            />

            <Metric
              label="Pending Queue"
              value={data.pending}
            />
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp />
            <h2 className="text-2xl font-bold">
              Top Contributors
            </h2>
          </div>

          <div className="space-y-4">
            {data.leaderboard.map((item, i) => (
              <div
                key={i}
                className="flex justify-between border rounded-2xl p-4"
              >
                <span>
                  #{i + 1}
                </span>

                <span>
                  {item.total_points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 space-y-4">
          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <Link
            href="/admin/listings"
            className="block px-5 py-4 rounded-2xl border hover:bg-muted"
          >
            Manage Listings
          </Link>

          <Link
            href="/admin/contributions"
            className="block px-5 py-4 rounded-2xl border hover:bg-muted"
          >
            Review Contributions
          </Link>

          <Link
            href="/admin/new"
            className="block px-5 py-4 rounded-2xl border hover:bg-muted"
          >
            Add Opportunity
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity />
            <h2 className="text-2xl font-bold">
              Recent Contributions
            </h2>
          </div>

          <div className="space-y-4">
            {data.recent.map((item) => (
              <div
                key={item.id}
                className="border rounded-2xl p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">
                      {item.title}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {item.contributor_name}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full border text-xs">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <h2 className="text-2xl font-bold mb-6">
            Recent API Usage
          </h2>

          <div className="space-y-3">
            {data.usage.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border rounded-xl p-4"
              >
                <div>
                  <p className="font-medium">
                    {item.service}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {item.action}
                  </p>
                </div>

                <div>
                  {item.success ? 'SUCCESS' : 'FAIL'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap />
          <h2 className="text-2xl font-bold">
            Feature Controls
          </h2>
        </div>

        <AdminControlCenter />
      </div>
    </div>
  );
}

function Card({ icon, title, value }: any) {
  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="mb-4">{icon}</div>
      <p className="text-muted-foreground">{title}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
}

function Metric({ label, value }: any) {
  return (
    <div className="border rounded-2xl p-4">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}