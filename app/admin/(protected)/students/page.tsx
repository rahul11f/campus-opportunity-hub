import { createServiceClient } from '@/lib/supabase/server';
import { Users, Search, MoreVertical, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  const supabase = createServiceClient();
  const { data: students } = await supabase
    .from('student_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-gray-400 text-sm mt-1">View and manage all registered student profiles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card rounded-xl p-5 border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Total Students</p>
          <p className="text-3xl font-bold text-white">{students?.length || 0}</p>
        </div>
        <div className="admin-card rounded-xl p-5 border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Verified Emails</p>
          <p className="text-3xl font-bold text-green-400">{students?.filter(s => s.email).length || 0}</p>
        </div>
        <div className="admin-card rounded-xl p-5 border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Active This Week</p>
          <p className="text-3xl font-bold text-blue-400">{students?.length || 0}</p>
        </div>
      </div>

      <div className="admin-card rounded-xl overflow-hidden">
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
            <div key={student.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] px-5 py-4 border-b border-white/[0.06] items-center hover:bg-white/[0.025] transition-colors">
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
              <div>
                <button className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
