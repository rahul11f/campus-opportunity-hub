'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  GraduationCap,
  Menu,
  X,
  LogOut,
  Shield,
  LayoutDashboard,
  Trophy,
  Briefcase,
  PlusCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type UserRole = 'guest' | 'student' | 'admin';

export function Navbar() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<UserRole>('guest');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(data?.role === 'admin' ? 'admin' : 'student');
    }

    loadUser();
  }, []);

  const signoutHref =
    role === 'admin'
      ? '/api/auth/signout?redirect=/admin/login'
      : '/api/auth/signout?redirect=/login';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold tracking-tight text-sm md:text-base">
            Campus Hub
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/search" className="flex items-center gap-2 hover:text-foreground transition-colors">
            <Briefcase className="w-4 h-4" />
            Opportunities
          </Link>

          <Link href="/leaderboard" className="flex items-center gap-2 hover:text-foreground transition-colors">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>

          <Link href="/dashboard/contribute" className="flex items-center gap-2 hover:text-foreground transition-colors">
            <PlusCircle className="w-4 h-4" />
            Contribute
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {role === 'guest' ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>

              <Link
                href="/admin/login"
                className="px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                Admin Access
              </Link>
            </>
          ) : (
            <>
              <Link
                href={role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                className="p-2 rounded-xl border"
              >
                {role === 'admin'
                  ? <Shield className="w-4 h-4" />
                  : <LayoutDashboard className="w-4 h-4" />}
              </Link>

              <a
                href={signoutHref}
                className="p-2 rounded-xl border"
              >
                <LogOut className="w-4 h-4" />
              </a>
            </>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        <button
          className="lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen
            ? <X className="w-6 h-6" />
            : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t px-4 py-4 space-y-3">
          <Link href="/search" className="block">Opportunities</Link>
          <Link href="/leaderboard" className="block">Leaderboard</Link>
          <Link href="/dashboard/contribute" className="block">Contribute</Link>
          <Link href="/login" className="block">Student Login</Link>
          <Link href="/admin/login" className="block">Admin Login</Link>
        </div>
      )}
    </header>
  );
}