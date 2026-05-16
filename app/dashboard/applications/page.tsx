import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ApplicationsPage() {
  const auth = createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = createServiceClient();

  const { data } = await supabase
    .from('student_applications')
    .select(`
      status,
      opportunities (*)
    `)
    .eq('user_id', user.id);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-5xl font-bold">
        My Applications
      </h1>

      {(data || []).map((item, i) => (
        <div
          key={i}
          className="rounded-3xl border bg-card p-6"
        >
          <h3 className="text-2xl font-bold">
            {item.opportunities?.role}
          </h3>

          <p className="text-muted-foreground">
            {item.opportunities?.company}
          </p>

          <p className="mt-4 text-primary">
            {item.status}
          </p>
        </div>
      ))}
    </div>
  );
}