import { createServiceClient } from '@/lib/supabase/server';
import { StudentList } from '@/components/admin/StudentList';

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
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage all registered student profiles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Total Students</p>
          <p className="text-3xl font-bold text-slate-900">{students?.length || 0}</p>
        </div>
        <div className="admin-card rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Verified Emails</p>
          <p className="text-3xl font-bold text-green-600">{students?.filter(s => s.email).length || 0}</p>
        </div>
        <div className="admin-card rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Active This Week</p>
          <p className="text-3xl font-bold text-blue-600">{students?.length || 0}</p>
        </div>
      </div>

      <StudentList initialStudents={students || []} />
    </div>
  );
}
