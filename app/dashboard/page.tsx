import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Trophy,
  Clock3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

async function getDashboardData(userId: string) {
  const supabase = createServiceClient();

  const [contribs, points] =
    await Promise.all([
      supabase
        .from('student_contributions')
        .select('*')
        .eq('user_id', userId),

      supabase
        .from('student_points')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

  return {
    contributions: contribs.data || [],
    points: points.data,
  };
}

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const data = await getDashboardData(user.id);

  const pending = data.contributions.filter(
    (x) => x.status === 'pending'
  ).length;

  const approved = data.contributions.filter(
    (x) => x.status === 'approved'
  ).length;

  const rejected = data.contributions.filter(
    (x) => x.status === 'rejected'
  ).length;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Student Dashboard
        </h1>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card icon={<Trophy />} title="Points" value={data.points?.total_points || 0} />
        <Card icon={<Clock3 />} title="Pending" value={pending} />
        <Card icon={<CheckCircle2 />} title="Approved" value={approved} />
        <Card icon={<XCircle />} title="Rejected" value={rejected} />
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
      <div className="mb-4">
        {icon}
      </div>

      <p>{title}</p>
      <p className="text-4xl font-bold">
        {value}
      </p>
    </div>
  );
}