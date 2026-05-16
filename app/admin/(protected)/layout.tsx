import Link from 'next/link';
import {
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  List,
  MessageSquare,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (adminEmails.length === 0) return false;

  return adminEmails.includes(email || '');
}

async function AdminNav(userEmail?: string | null) {
  const navItems = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/new',
    label: 'New Listing',
    icon: PlusCircle,
  },
  {
    href: '/admin/listings',
    label: 'All Listings',
    icon: List,
  },
  {
    href: '/admin/contributions',
    label: 'Contributions',
    icon: MessageSquare,
  },
];

  return (
    <aside className="w-full md:w-64 md:min-h-screen bg-card border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>

          <div>
            <span className="text-sm font-bold text-foreground block">
              Campus Hub
            </span>
            <span className="text-xs text-muted-foreground">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      <div className="p-3 border-b border-border">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Website
        </Link>
      </div>

      <nav className="flex flex-col md:flex-1 p-3 gap-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-foreground truncate">
            {userEmail}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Administrator
          </p>
        </div>

        <form action="/api/auth/signout?redirect=/admin/login" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  if (!isAdmin(user.email)) {
    redirect('/admin/login?error=unauthorized');
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {await AdminNav(user.email)}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

