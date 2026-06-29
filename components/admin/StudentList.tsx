'use client';

import { useState } from 'react';
import { Users, MoreVertical, ShieldCheck, Ban, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function StudentList({ initialStudents }: { initialStudents: any[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  async function handleAction(userId: string, action: 'ban' | 'unban' | 'delete') {
    if (action === 'delete') {
      if (!confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
    }
    
    setLoadingAction(userId);
    setOpenDropdown(null);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to perform action');
      }

      toast.success(`User successfully ${action === 'delete' ? 'deleted' : action === 'ban' ? 'banned' : 'unbanned'}`);
      
      if (action === 'delete') {
        setStudents(s => s.filter(x => x.user_id !== userId));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="admin-card rounded-xl overflow-visible relative">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] px-5 py-3.5 border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div>Student</div>
        <div>Branch</div>
        <div>Batch</div>
        <div>CGPA</div>
        <div>Joined</div>
        <div></div>
      </div>

      {!students || students.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No students found</p>
        </div>
      ) : (
        students.map((student) => (
          <div key={student.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] px-5 py-4 border-b border-white/[0.06] items-center hover:bg-white/[0.025] transition-colors relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  {student.full_name || 'Anonymous'}
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                </p>
                <p className="text-xs text-gray-400">{student.email}</p>
              </div>
            </div>
            <div className="text-sm text-gray-300">{student.branch || '-'}</div>
            <div className="text-sm text-gray-300">{student.batch || '-'}</div>
            <div className="text-sm text-gray-300">{student.cgpa || '-'}</div>
            <div className="text-sm text-gray-400">
              {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
            </div>
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === student.user_id ? null : student.user_id)}
                disabled={loadingAction === student.user_id}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {loadingAction === student.user_id ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}
              </button>
              
              {openDropdown === student.user_id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#1e2333] border border-white/10 shadow-2xl overflow-hidden z-50">
                    <button 
                      onClick={() => handleAction(student.user_id, 'ban')}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-amber-500 hover:bg-amber-500/10 flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" /> Ban User
                    </button>
                    <button 
                      onClick={() => handleAction(student.user_id, 'unban')}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-green-500 hover:bg-green-500/10 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Unban User
                    </button>
                    <div className="h-px w-full bg-white/10" />
                    <button 
                      onClick={() => handleAction(student.user_id, 'delete')}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete User
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
