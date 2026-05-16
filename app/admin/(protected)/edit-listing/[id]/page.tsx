import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditListingForm } from './EditListingForm';

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return <EditListingForm listing={data} />;
}