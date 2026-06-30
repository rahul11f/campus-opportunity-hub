'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ResetLeaderboardButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReset() {
    if (!confirm('Are you sure you want to reset the entire leaderboard? This will set all student points to 0. This cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system/reset-leaderboard', {
        method: 'POST'
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reset leaderboard');
      }
      
      toast.success('Leaderboard reset successfully');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      Reset Leaderboard
    </button>
  );
}
