import { createServiceClient } from '@/lib/supabase/server';
import ListingsClient from './ListingsClient';

export default async function ListingsPage() {
  const { data } = await createServiceClient()
    .from('opportunities')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  return (
    <ListingsClient data={data || []} />
  );
}
