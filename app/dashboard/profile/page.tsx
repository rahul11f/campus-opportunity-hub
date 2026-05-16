import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileEditor from '@/components/dashboard/ProfileEditor';

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="max-w-5xl mx-auto p-8">
      <ProfileEditor
        userId={user.id}
        initialName={profile?.full_name || ''}
        initialEmail={profile?.email || user.email || ''}
      />
    </div>
  );
}
