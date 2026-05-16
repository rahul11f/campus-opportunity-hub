import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function NotificationsPage() {
  const auth = createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = createServiceClient();

  const { data } = await supabase
    .from('student_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-5xl font-bold">
        Notifications
      </h1>

      {(data || []).map((item) => (
        <div
          key={item.id}
          className="rounded-3xl border bg-card p-6"
        >
          <h3 className="text-xl font-bold">
            {item.title}
          </h3>

          <p className="mt-3 text-muted-foreground">
            {item.message}
          </p>
        </div>
      ))}
    </div>
  );
}