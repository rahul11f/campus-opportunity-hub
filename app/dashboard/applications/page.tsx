import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ApplicationsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      notes,
      created_at,
      opportunities (
        id,
        company,
        role,
        location
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Application Tracker</h1>

        <div className="space-y-4">
          {applications?.length ? applications.map((item: any) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold">
                {item.opportunities?.role}
              </h2>

              <p className="text-muted-foreground">
                {item.opportunities?.company} • {item.opportunities?.location}
              </p>

              <p className="mt-3 text-sm">
                Status: <strong>{item.status}</strong>
              </p>

              <Link
                href={`/opportunities/${item.opportunities?.id}`}
                className="text-primary hover:underline mt-3 inline-block"
              >
                View opportunity
              </Link>
            </div>
          )) : (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              No tracked applications yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
