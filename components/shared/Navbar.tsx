'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Search,
  GraduationCap,
  Menu,
  X,
  LogOut,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CollegeSelector } from '@/components/shared/CollegeSelector';

type UserRole = 'guest' | 'student' | 'admin';

interface College {
  id: string;
  name: string;
  slug: string;
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<UserRole>('guest');
  const [menuOpen, setMenuOpen] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setRole(data?.role === 'admin' ? 'admin' : 'student');
      }

      const { data: collegeData } = await supabase
        .from('colleges')
        .select('id,name,slug')
        .eq('is_active', true)
        .order('name');

      setColleges(collegeData || []);
    }

    loadData();
  }, []);

  const signoutHref =
    role === 'admin'
      ? '/api/auth/signout?redirect=/admin/login'
      : '/api/auth/signout?redirect=/login';

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-primary" />
          <span className="font-bold">
            Campus Opportunity Hub
          </span>
        </Link>

        <CollegeSelector
          colleges={colleges}
          currentSlug={pathname?.split('/')[1] || ''}
        />

        <div className="flex items-center gap-3">
          <Link href="/leaderboard" className="text-sm font-medium">
            Leaderboard
          </Link>

          <Link href="/search" className="text-sm font-medium">Opportunities</Link>

          <Link
            href="/login"
            className="text-sm font-medium text-primary"
          >
            Contribute
          </Link>

          {role === 'guest' && (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg border"
              >
                Student Login
              </Link>

              <Link
                href="/admin/login"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
              >
                Admin Login
              </Link>
            </>
          )}

          {role !== 'guest' && (
            <>
              <Link
                href={
                  role === 'admin'
                    ? '/admin/dashboard'
                    : '/dashboard'
                }
                className="p-2 rounded-lg border"
              >
                {role === 'admin'
                  ? <Shield className="w-4 h-4" />
                  : <LayoutDashboard className="w-4 h-4" />}
              </Link>

              <a
                href={signoutHref}
                className="p-2 rounded-lg border"
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
      </div>
    </header>
  );
}

