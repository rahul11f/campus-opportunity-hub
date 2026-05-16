import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Bookmark, MapPin, ArrowRight } from 'lucide-react';

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
        location,
        salary
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Saved Opportunities
        </h1>
        <p className="text-muted-foreground mt-2">
          Track opportunities you want to revisit.
        </p>
      </div>

      <div className="space-y-5">
        {saved?.length ? (
          saved.map((item: any) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bookmark className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold">
                        {item.opportunities?.role}
                      </h2>
                      <p className="text-muted-foreground">
                        {item.opportunities?.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>
                      {item.opportunities?.type}
                    </span>

                    {item.opportunities?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.opportunities.location}
                      </span>
                    )}

                    {item.opportunities?.salary && (
                      <span>
                        {item.opportunities.salary}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/opportunities/${item.opportunities?.id}`}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground"
                >
                  View Opportunity
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Bookmark className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              No saved opportunities
            </h2>
            <p className="text-muted-foreground">
              Save listings to track them later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}