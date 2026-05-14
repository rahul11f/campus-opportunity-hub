import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function SavedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: saved } = await supabase
    .from('saved_opportunities')
    .select(`
      id,
      created_at,
      opportunities (
        id,
        company,
        role,
        type,
        location
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Saved Opportunities</h1>

        <div className="space-y-4">
          {saved?.length ? saved.map((item: any) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold">
                {item.opportunities?.role}
              </h2>

              <p className="text-muted-foreground mb-4">
                {item.opportunities?.company} • {item.opportunities?.location}
              </p>

              <Link
                href={`/opportunities/${item.opportunities?.id}`}
                className="text-primary hover:underline"
              >
                View opportunity
              </Link>
            </div>
          )) : (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              No saved opportunities yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
