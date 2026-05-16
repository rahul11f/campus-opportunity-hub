import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function signOut() {
  'use server';

  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const nav = [
    ['Home', '/'],
    ['Dashboard', '/dashboard'],
    ['Contribute', '/dashboard/contribute'],
    ['My Contributions', '/dashboard/my-contributions'],
    ['Leaderboard', '/dashboard/leaderboard'],
    ['Saved', '/dashboard/saved'],
    ['Profile', '/dashboard/profile'],
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-72 border-r p-6">
        <h2 className="text-2xl font-bold mb-8">
          Student Panel
        </h2>

        <nav className="space-y-3">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block px-4 py-3 rounded-xl hover:bg-muted"
            >
              {label}
            </Link>
          ))}
        </nav>

        <form action={signOut} className="mt-8">
          <button className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-semibold">
            Sign Out
          </button>
        </form>
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
