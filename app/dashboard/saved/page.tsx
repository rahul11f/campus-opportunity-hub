import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OpportunityGrid } from '@/components/opportunity/OpportunityGrid';

export default async function SavedPage() {
  const auth = createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = createServiceClient();

  const { data: saved } = await supabase
    .from('student_saved_opportunities')
    .select('opportunity_id')
    .eq('user_id', user.id);

  const ids = (saved || []).map(
    (x) => x.opportunity_id
  );

  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .in('id', ids);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-5xl font-bold">
        Saved Opportunities
      </h1>

      <OpportunityGrid
        opportunities={data || []}
        showAds={false}
      />
    </div>
  );
}