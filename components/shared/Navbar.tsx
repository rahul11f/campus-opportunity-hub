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
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          <span className="font-bold text-sm md:text-base">
            Campus Opportunity Hub
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/search" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Opportunities
          </Link>

          <Link href="/leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>

          <Link href="/dashboard/contribute" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Contribute
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {role === 'guest' ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl border"
              >
                Student Login
              </Link>

              <Link
                href="/admin/login"
                className="px-4 py-2 rounded-xl bg-primary text-white"
              >
                Admin
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
              onClick={() =>
                setTheme(theme === 'dark' ? 'light' : 'dark')
              }
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
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