import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentAuthForm } from '@/components/auth/StudentAuthForm';

export default async function LoginPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      redirect('/admin/dashboard');
    }

    redirect('/dashboard');
  }

  return <StudentAuthForm />;
}
