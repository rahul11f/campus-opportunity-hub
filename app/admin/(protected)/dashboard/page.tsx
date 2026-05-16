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
    recent,
    usage,
  ] = await Promise.all([
    supabase
      .from('student_contributions')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'pending'),

    supabase
      .from('student_contributions')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'approved')
      .gte('reviewed_at', `${today}T00:00:00`),

    supabase
      .from('student_contributions')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'rejected')
      .gte('reviewed_at', `${today}T00:00:00`),

    supabase
      .from('student_profiles')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('opportunities')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('student_points')
      .select('*')
      .order('total_points', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('student_contributions')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(5),

    supabase
      .from('api_usage_logs')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(20),
  ]);

  return {
    pending: pending.count || 0,
    approved: approved.count || 0,
    rejected: rejected.count || 0,
    students: students.count || 0,
    listings: listings.count || 0,
    top: top.data,
    recent: recent.data || [],
    usage: usage.data || [],
  };
}

export default async function AdminDashboardPage() {
  const data = await getData();

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Admin Control Center
        </h1>

        <p className="text-muted-foreground mt-2">
          Platform monitoring and management
        </p>
      </div>

      <div className="grid md:grid-cols-6 gap-5">
        <Card icon={<Clock3 />} title="Pending" value={data.pending} />
        <Card icon={<CheckCircle2 />} title="Approved Today" value={data.approved} />
        <Card icon={<XCircle />} title="Rejected Today" value={data.rejected} />
        <Card icon={<Users />} title="Students" value={data.students} />
        <Card icon={<Briefcase />} title="Listings" value={data.listings} />
        <Card icon={<Trophy />} title="Top Points" value={data.top?.total_points || 0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border bg-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Recent Contributions
            </h2>

            <Link
              href="/admin/contributions"
              className="text-primary font-semibold"
            >
              Review All →
            </Link>
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

                  <span className="text-xs px-3 py-1 rounded-full border">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">
              Quick Actions
            </h2>
          </div>

          <Link href="/admin/listings" className="block px-5 py-4 rounded-2xl border hover:bg-muted">
            Manage Listings
          </Link>

          <Link href="/admin/contributions" className="block px-5 py-4 rounded-2xl border hover:bg-muted">
            Review Contributions
          </Link>

          <Link href="/admin/new-listing" className="block px-5 py-4 rounded-2xl border hover:bg-muted">
            Add Opportunity
          </Link>
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
                {item.success ? '✅' : '❌'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  value,
}: any) {
  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="mb-4">
        {icon}
      </div>

      <p className="text-muted-foreground">
        {title}
      </p>

      <p className="text-4xl font-bold">
        {value}
      </p>
    </div>
  );
}