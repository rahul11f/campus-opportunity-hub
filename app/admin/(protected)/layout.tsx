'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  List,
  MessageSquare,
  LogOut,
  ArrowLeft,
  Users,
  Trophy,
  Bot,
  Megaphone,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { SiteLogo } from '@/components/ui/SiteLogo';

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return true; // fallback: allow in dev
  return adminEmails.includes(email || '');
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/new', label: 'New Listing', icon: PlusCircle },
  { href: '/admin/listings', label: 'All Listings', icon: List },
  { href: '/admin/contributions', label: 'Contributions', icon: MessageSquare, badge: true },
  { href: '/admin/categories', label: 'Categories', icon: List },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/admin/ai-tools', label: 'API & AI Tools', icon: Bot },
  { href: '/admin/ads', label: 'Ads Management', icon: Megaphone },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ pendingCount, userEmail }: { pendingCount: number; userEmail?: string }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-3">
          <SiteLogo size="sm" />
          <div>
            <span className="text-sm font-bold text-slate-900 block leading-tight">Campus Opportunity Hub</span>
            <span className="text-xs text-slate-500">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Back to website */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-200">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Website
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1 p-3 gap-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && pendingCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {userEmail?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">{userEmail || 'Admin'}</p>
            <p className="text-[11px] text-slate-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = '/admin/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [pendingCount, setPendingCount] = useState(0);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    let channel: any = null;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/admin/login';
        return;
      }
      setUserEmail(user.email || '');
      setAuthorized(true);

      // Load pending contributions count
      const { count } = await supabase
        .from('student_contributions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setPendingCount(count || 0);

      // Real-time subscription to contribution changes
      try {
        const subChannel = supabase.channel('admin-layout-contrib');
        if (subChannel) {
          channel = subChannel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'student_contributions' }, (payload) => {
              supabase
                .from('student_contributions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')
                .then(({ count: c }) => {
                  setPendingCount(c || 0);
                });
            })
            .subscribe();
        }
      } catch (err) {
        console.warn('Real-time subscription failed:', err);
      }
    }

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (authorized === null) {
    return (
      <div className="min-h-screen admin-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen admin-bg">
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar w-64 min-h-screen hidden md:flex flex-col shrink-0 fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent pendingCount={pendingCount} userEmail={userEmail} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200 md:hidden flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
            <SidebarContent pendingCount={pendingCount} userEmail={userEmail} />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-x-hidden overflow-y-auto min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <span className="font-semibold text-sm text-slate-900">Admin Panel</span>
        </div>
        {children}
      </main>
    </div>
  );
}
