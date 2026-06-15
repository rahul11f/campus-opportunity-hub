import { createServiceClient } from '@/lib/supabase/server';
import ListingsClient from './ListingsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ListingsPage() {
  const { data } = await createServiceClient()
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false });

  return <ListingsClient data={data || []} />;
}
