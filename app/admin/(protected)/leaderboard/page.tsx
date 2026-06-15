import { createServiceClient } from '@/lib/supabase/server';
import { Trophy, Medal, Crown } from 'lucide-react';

export const dynamic = 'force-dynamic';

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
        name: profile?.full_name || 'Anonymous',
        email: profile?.email || 'Unknown',
        points: item.total_points || 0,
        approved: item.approved_contributions || 0,
        pending: item.pending_contributions || 0,
      };
    })
  );

  return rows;
}

export default async function AdminLeaderboardPage() {
  const rows = await getLeaderboard();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-gray-400 text-sm mt-1">Student contributors ranked by points earned.</p>
        </div>
      </div>

      <div className="admin-card rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] px-5 py-3.5 border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Rank</div>
          <div>Student</div>
          <div>Points</div>
          <div>Approved</div>
          <div>Pending</div>
        </div>

        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <Trophy className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No contributors yet</p>
          </div>
        ) : (
          rows.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] px-5 py-4 border-b border-white/[0.06] items-center hover:bg-white/[0.025] transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-500'}`}>
                  {i === 0 ? <Crown className="w-4 h-4" /> : i === 1 ? <Medal className="w-4 h-4" /> : i === 2 ? <Trophy className="w-4 h-4" /> : <span className="text-xs font-bold">#{i + 1}</span>}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-xs text-gray-400">{item.email}</p>
              </div>
              <div className="text-sm font-bold text-blue-400">{item.points}</div>
              <div className="text-sm text-green-400 font-medium">{item.approved}</div>
              <div className="text-sm text-amber-400 font-medium">{item.pending}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
