import { createServiceClient } from '@/lib/supabase/server';
import { Trophy, Medal, Crown } from 'lucide-react';

async function getLeaderboard() {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('student_points')
    .select('*')
    .order('total_points', {
      ascending: false,
    });

  const rows = await Promise.all(
    (data || []).map(async (item) => {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('full_name,email')
        .eq('user_id', item.user_id)
        .maybeSingle();

      return {
        name:
          profile?.full_name ||
          profile?.email ||
          'Student',
        points: item.total_points || 0,
        approved:
          item.approved_contributions || 0,
      };
    })
  );

  return rows;
}

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();
  const top = rows[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div className="rounded-3xl border bg-card p-10 text-center">
        <Crown className="mx-auto w-12 h-12 mb-4 text-yellow-400" />

        <h1 className="text-5xl font-bold">
          Contributor Leaderboard
        </h1>

        {top && (
          <>
            <p className="mt-6 text-xl">
              Top Contributor:
            </p>

            <p className="text-3xl font-bold text-primary mt-2">
              {top.name}
            </p>

            <p className="text-muted-foreground mt-2">
              {top.points} points
            </p>
          </>
        )}
      </div>

      <div className="rounded-3xl border bg-card overflow-hidden">
        <div className="grid grid-cols-4 px-6 py-5 border-b font-semibold">
          <div>Rank</div>
          <div>Name</div>
          <div>Points</div>
          <div>Approved</div>
        </div>

        {rows.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-4 px-6 py-5 border-b items-center"
          >
            <div className="flex items-center gap-3">
              {i === 0 ? (
                <Crown className="text-yellow-400" />
              ) : i === 1 ? (
                <Medal />
              ) : (
                <Trophy />
              )}

              #{i + 1}
            </div>

            <div>{item.name}</div>
            <div>{item.points}</div>
            <div>{item.approved}</div>
          </div>
        ))}
      </div>
    </div>
  );
}