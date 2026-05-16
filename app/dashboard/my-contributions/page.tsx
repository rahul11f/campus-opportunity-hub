import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Trophy,
  Clock3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

async function getData(userId: string) {
  const supabase = createServiceClient();

  const [contribs, points, board] =
    await Promise.all([
      supabase
        .from('student_contributions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {
          ascending: false,
        }),

      supabase
        .from('student_points')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),

      supabase
        .from('student_points')
        .select('*')
        .order('total_points', {
          ascending: false,
        }),
    ]);

  const rank =
    (board.data || []).findIndex(
      (x) => x.user_id === userId
    ) + 1;

  return {
    contributions: contribs.data || [],
    points: points.data,
    rank: rank > 0 ? rank : null,
  };
}

export default async function MyContributionsPage() {
  const auth = createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const data = await getData(user.id);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          My Contributions
        </h1>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <Stat
          icon={<Trophy />}
          title="Points"
          value={data.points?.total_points || 0}
        />

        <Stat
          icon={<Trophy />}
          title="Rank"
          value={data.rank || '-'}
        />

        <Stat
          icon={<Clock3 />}
          title="Pending"
          value={
            data.contributions.filter(
              (x) => x.status === 'pending'
            ).length
          }
        />

        <Stat
          icon={<CheckCircle2 />}
          title="Approved"
          value={
            data.contributions.filter(
              (x) => x.status === 'approved'
            ).length
          }
        />

        <Stat
          icon={<XCircle />}
          title="Rejected"
          value={
            data.contributions.filter(
              (x) => x.status === 'rejected'
            ).length
          }
        />
      </div>

      <div className="space-y-5">
        {data.contributions.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border bg-card p-6"
          >
            <div className="flex justify-between items-start gap-6">
              <div>
                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="text-muted-foreground mt-2">
                  {item.type}
                </p>

                <p className="mt-4 line-clamp-4">
                  {item.content}
                </p>

                {item.source_link && (
                  <a
                    href={item.source_link}
                    target="_blank"
                    className="text-primary mt-4 inline-block"
                  >
                    View Source
                  </a>
                )}
              </div>

              <div>
                <span
                  className={`px-4 py-2 rounded-full text-sm ${
                    item.status === 'approved'
                      ? 'bg-green-500/20 text-green-400'
                      : item.status === 'rejected'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {item.status}
                </span>

                {item.rejection_reason && (
                  <p className="text-red-400 text-sm mt-3 max-w-xs">
                    {item.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  icon,
  title,
  value,
}: any) {
  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="mb-4">
        {icon}
      </div>

      <p>{title}</p>
      <p className="text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}