import Link from 'next/link';
import {
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  List,
  LogOut,
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
  ];

  return (
    <aside className="w-56 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>

          <div>
            <span className="text-xs font-bold text-foreground block leading-tight">
              Campus Hub
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-foreground truncate">
            {userEmail}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Administrator
          </p>
        </div>

        <form action="/api/auth/signout?redirect=/admin/login" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
    <div className="flex min-h-screen bg-background">
      {await AdminNav(user.email)}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}


