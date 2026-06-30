'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Bookmark,
  Briefcase,
  Trophy,
  Bell,
  User,
  Send,
  FileText,
  LogOut,
  GraduationCap,
  ChevronRight,
  X,
  Menu,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard',                label: 'Overview',        icon: LayoutDashboard },
  { href: '/dashboard/saved',          label: 'Saved',           icon: Bookmark         },
  { href: '/dashboard/applications',   label: 'Applications',    icon: Briefcase        },
  { href: '/contribute',     label: 'Contribute',      icon: Send             },
  { href: '/dashboard/my-contributions', label: 'Contributions', icon: FileText         },
  { href: '/dashboard/leaderboard',    label: 'Leaderboard',     icon: Trophy           },
  { href: '/dashboard/notifications',  label: 'Notifications',   icon: Bell             },
  { href: '/dashboard/profile',        label: 'Profile',         icon: User             },
];

function SidebarContent({
  user,
  notifCount,
  pathname,
  onSignOut,
}: {
  user: any;
  notifCount: number;
  pathname: string;
  onSignOut: () => void;
}) {
  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Campus Hub</p>
            <p className="text-xs text-muted-foreground">Student Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const badge = href === '/dashboard/notifications' && notifCount > 0 ? notifCount : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg bg-muted/40">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let channel: any = null;
    let mounted = true;

    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!mounted) return;
      if (!u) { router.push('/login'); return; }
      setUser(u);

      // Notif count
      const { count } = await supabase
        .from('student_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', u.id)
        .eq('read', false);
      if (mounted) setNotifCount(count || 0);

      // Subscribe to notif changes
      channel = supabase
        .channel(`dash-notif-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'student_notifications', filter: `user_id=eq.${u.id}` }, async (payload) => {
          if (payload.eventType === 'INSERT') {
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch (e) {}
            toast.info(payload.new.title, { description: payload.new.message });
          }
          const { count: c } = await supabase
            .from('student_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', u.id)
            .eq('read', false);
          if (mounted) setNotifCount(c || 0);
        })
        .subscribe();
    });

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card shrink-0 fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent user={user} notifCount={notifCount} pathname={pathname} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 z-[70] w-64 bg-card border-r border-border md:hidden flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent user={user} notifCount={notifCount} pathname={pathname} onSignOut={handleSignOut} />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-accent">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm">Student Dashboard</span>
        </div>

        <main className="flex-1 overflow-auto pb-24 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}