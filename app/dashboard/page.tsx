import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    redirect('/admin/dashboard');
  }

  const { count: savedCount } = await supabase
    .from('saved_opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: applicationCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">
            Student Dashboard
          </h1>

          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || user.email}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">
              Saved Opportunities
            </h2>
            <p className="text-3xl font-bold mb-3">
              {savedCount || 0}
            </p>
            <Link
              href="/dashboard/saved"
              className="text-sm text-primary hover:underline"
            >
              View saved opportunities
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">
              Applications
            </h2>
            <p className="text-3xl font-bold mb-3">
              {applicationCount || 0}
            </p>
            <Link
              href="/dashboard/applications"
              className="text-sm text-primary hover:underline"
            >
              View tracked applications
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">
              Profile
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your student profile and preferences
            </p>
            <Link
              href="/dashboard/profile"
              className="text-sm text-primary hover:underline"
            >
              Open profile
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              Browse Opportunities
            </Link>

            <Link
              href="/dashboard/saved"
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium"
            >
              Saved
            </Link>

            <Link
              href="/dashboard/applications"
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium"
            >
              Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
