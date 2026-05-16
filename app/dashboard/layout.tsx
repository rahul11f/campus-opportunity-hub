import Link from 'next/link';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Bell,
  LayoutDashboard,
  Trophy,
  Bookmark,
  User,
  Send,
  Briefcase,
  LogOut,
  Home,
} from 'lucide-react';

async function signOut() {
  'use server';

  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

async function getNotificationCount(userId: string) {
  const supabase = createServiceClient();

  const { count } = await supabase
    .from('student_notifications')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('user_id', userId)
    .eq('read', false);

  return count || 0;
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

  const notifications =
    await getNotificationCount(user.id);

  const nav = [
    {
      label: 'Home',
      href: '/',
      icon: <Home className="w-4 h-4" />,
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Contribute',
      href: '/dashboard/contribute',
      icon: <Send className="w-4 h-4" />,
    },
    {
      label: 'My Contributions',
      href: '/dashboard/my-contributions',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      label: 'Applications',
      href: '/dashboard/applications',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      label: 'Saved',
      href: '/dashboard/saved',
      icon: <Bookmark className="w-4 h-4" />,
    },
    {
      label: 'Leaderboard',
      href: '/dashboard/leaderboard',
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: notifications,
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: <User className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-80 border-r p-6 bg-card">
        <h2 className="text-3xl font-bold mb-10">
          Student Hub
        </h2>

        <nav className="space-y-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>

              {item.badge ? (
                <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <form action={signOut} className="mt-10">
          <button className="w-full px-4 py-4 rounded-2xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
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