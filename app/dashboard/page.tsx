import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Trophy,
  Clock3,
  CheckCircle2,
  XCircle,
  Bookmark,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

async function getDashboardData(userId: string) {
  const supabase = createServiceClient();

  const [
    contribs,
    points,
    saved,
    applications,
    leaderboard,
  ] = await Promise.all([
    supabase
      .from('student_contributions')
      .select('*')
      .eq('user_id', userId),

    supabase
      .from('student_points')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),

    supabase
      .from('student_saved_opportunities')
      .select('*')
      .eq('user_id', userId),

    supabase
      .from('student_applications')
      .select('*')
      .eq('user_id', userId),

    supabase
      .from('student_points')
      .select('*')
      .order('total_points', {
        ascending: false,
      }),
  ]);

  const rank =
    (leaderboard.data || []).findIndex(
      (x) => x.user_id === userId
    ) + 1;

  return {
    contributions: contribs.data || [],
    points: points.data,
    saved: saved.data || [],
    applications:
      applications.data || [],
    rank: rank > 0 ? rank : null,
  };
}

export default async function DashboardPage() {
  const auth = createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const data = await getDashboardData(user.id);

  const pending =
    data.contributions.filter(
      (x) => x.status === 'pending'
    ).length;

  const approved =
    data.contributions.filter(
      (x) => x.status === 'approved'
    ).length;

  const rejected =
    data.contributions.filter(
      (x) => x.status === 'rejected'
    ).length;

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-5xl font-bold">
          Student Intelligence Dashboard
        </h1>

        <p className="text-muted-foreground mt-3">
          Track opportunities, contributions and performance.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card icon={<Trophy />} title="Points" value={data.points?.total_points || 0} />
        <Card icon={<TrendingUp />} title="Rank" value={data.rank || '-'} />
        <Card icon={<Bookmark />} title="Saved" value={data.saved.length} />
        <Card icon={<Briefcase />} title="Applications" value={data.applications.length} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card icon={<Clock3 />} title="Pending Contributions" value={pending} />
        <Card icon={<CheckCircle2 />} title="Approved Contributions" value={approved} />
        <Card icon={<XCircle />} title="Rejected Contributions" value={rejected} />
      </div>

      <div className="rounded-3xl border bg-card p-8">
        <h2 className="text-2xl font-bold">
          Performance Summary
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Mini title="Contribution Success Rate">
            {data.contributions.length
              ? Math.round(
                  (approved /
                    data.contributions.length) *
                    100
                )
              : 0}
            %
          </Mini>

          <Mini title="Reward Points Earned">
            {data.points?.total_points || 0}
          </Mini>

          <Mini title="Opportunities Tracked">
            {data.saved.length +
              data.applications.length}
          </Mini>
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
    <div className="rounded-3xl border bg-card p-8">
      <div className="mb-4">{icon}</div>
      <p>{title}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
}

function Mini({
  title,
  children,
}: any) {
  return (
    <div className="rounded-2xl border p-6">
      <p className="text-muted-foreground">
        {title}
      </p>

      <p className="text-3xl font-bold mt-3">
        {children}
      </p>
    </div>
  );
}